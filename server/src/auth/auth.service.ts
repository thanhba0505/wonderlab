import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Optional,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as argon2 from 'argon2';
import { OtpType, Role } from '@prisma/client';
import { SafeUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SsoCallbackDto } from './dto/sso-callback.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto, SetPasswordDto } from './dto/change-password.dto';
import { UserProfileDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { OtpService } from './otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { I18nService } from '../i18n/i18n.service';
import { S2SService } from '../s2s/s2s.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly prisma: PrismaService,
    private readonly i18nService: I18nService = new I18nService(),
    @Optional() private readonly s2sService?: S2SService,
  ) {}

  /**
   * Validate user credentials via Central Gateway Master IAM (BFF Proxy)
   */
  async validateUser(dto: LoginDto, locale?: string): Promise<SafeUser> {
    if (!this.s2sService) {
      throw new BadRequestException('Dịch vụ xác thực Central Gateway chưa được khởi tạo.');
    }

    let gwRes: {
      user: {
        id: string;
        username: string;
        email: string | null;
        role: 'ADMIN' | 'USER';
        avatarUrl: string | null;
        isActive: boolean;
      };
    };

    try {
      gwRes = await this.s2sService.call<{
        user: {
          id: string;
          username: string;
          email: string | null;
          role: 'ADMIN' | 'USER';
          avatarUrl: string | null;
          isActive: boolean;
        };
      }>('central-gateway', '/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: dto.username,
          password: dto.password,
        }),
      });
    } catch {
      const msg = this.i18nService.t('auth.invalid_credentials', locale);
      throw new UnauthorizedException({
        message: msg,
        errors: { password: [msg] },
      });
    }

    if (!gwRes?.user) {
      const msg = this.i18nService.t('auth.invalid_credentials', locale);
      throw new UnauthorizedException({
        message: msg,
        errors: { password: [msg] },
      });
    }

    const gwUser = gwRes.user;
    if (gwUser.isActive === false) {
      const msg = this.i18nService.t('auth.account_disabled', locale);
      throw new UnauthorizedException({
        message: msg,
        errors: { username: [msg] },
      });
    }

    return this.syncLocalUser(gwUser);
  }

  /**
   * Login user and issue HttpOnly cookie
   */
  async login(
    user: SafeUser,
    response: Response,
    locale?: string,
  ): Promise<{ message: string; user: UserProfileDto }> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
    });

    const detailedUser = await this.getDetailedProfile(user);

    const resolvedLocale = this.i18nService.resolveLocale(locale);
    const successMsg = resolvedLocale === 'en' ? 'Logged in successfully' : 'Đăng nhập thành công';

    return {
      message: successMsg,
      user: detailedUser,
    };
  }

  /**
   * Single Sign-On (SSO) login via Central Gateway OAuth2 PKCE
   */
  async loginWithSso(
    dto: SsoCallbackDto,
    response: Response,
    locale?: string,
  ): Promise<{ message: string; user: UserProfileDto }> {
    const gatewayConn = await this.s2sService?.getConnection('central-gateway');
    const gatewayUrl = gatewayConn
      ? `${gatewayConn.domain}${gatewayConn.apiPrefix}`
      : process.env.GATEWAY_URL || 'https://central-gateway-server.onrender.com/api/v1';

    let gatewayRes: globalThis.Response;
    try {
      gatewayRes = await fetch(`${gatewayUrl}/auth/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: 'wonderlab',
          code: dto.code,
          code_verifier: dto.code_verifier,
        }),
      });
    } catch {
      throw new UnauthorizedException('Failed to communicate with Central Gateway SSO');
    }

    if (!gatewayRes.ok) {
      const errorBody = (await gatewayRes.json().catch(() => ({}))) as { message?: string };
      throw new UnauthorizedException(errorBody.message || 'SSO authentication failed');
    }

    const data = (await gatewayRes.json()) as {
      user: {
        id?: string;
        username: string;
        email?: string | null;
        role?: string;
        avatarUrl?: string | null;
        isActive?: boolean;
      };
    };
    const ssoUser = data.user;

    if (ssoUser.isActive === false) {
      const msg = this.i18nService.t('auth.account_disabled', locale);
      throw new UnauthorizedException(msg);
    }

    const safeUser = await this.syncLocalUser({
      id: ssoUser.id || `sso_${Date.now()}`,
      username: ssoUser.username,
      email: ssoUser.email,
      role: ssoUser.role,
      avatarUrl: ssoUser.avatarUrl,
      isActive: ssoUser.isActive,
    });

    return this.login(safeUser, response, locale);
  }

  /**
   * Đăng ký tài khoản người dùng qua Central Gateway Master IAM và tạo bản ghi cục bộ
   */
  async register(
    dto: RegisterDto,
    locale?: string,
  ): Promise<{ message: string; email: string; requireOtp: boolean }> {
    if (!this.s2sService) {
      throw new BadRequestException('Dịch vụ xác thực Central Gateway chưa được cấu hình.');
    }

    let gwUser: {
      id: string;
      username: string;
      email: string | null;
      role: string;
      avatarUrl: string | null;
      isActive: boolean;
    };

    try {
      gwUser = await this.s2sService.call<{
        id: string;
        username: string;
        email: string | null;
        role: string;
        avatarUrl: string | null;
        isActive: boolean;
      }>('central-gateway', '/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: dto.username,
          email: dto.email,
          password: dto.password,
        }),
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('already taken') || errMsg.includes('already registered')) {
        const isUsername = errMsg.includes('Username');
        const msg = isUsername
          ? this.i18nService.t('auth.username_exists', locale)
          : this.i18nService.t('auth.email_exists', locale);
        throw new BadRequestException({
          message: msg,
          errors: { [isUsername ? 'username' : 'email']: [msg] },
        });
      }
      throw new BadRequestException('Không thể đăng ký tài khoản qua Central Gateway.');
    }

    await this.syncLocalUser(gwUser);

    const resolvedLocale = this.i18nService.resolveLocale(locale);
    const successMsg =
      resolvedLocale === 'en'
        ? 'Registration successful. You can now log in.'
        : 'Đăng ký thành công. Bạn có thể đăng nhập ngay.';

    return {
      message: successMsg,
      email: dto.email,
      requireOtp: false,
    };
  }

  /**
   * Xác thực mã OTP 6 số để kích hoạt email và tự động đăng nhập
   */
  async verifyEmail(
    dto: VerifyEmailDto,
    response: Response,
    locale?: string,
  ): Promise<{ message: string; user: UserProfileDto }> {
    const normalizedEmail = dto.email.toLowerCase();

    // Xác thực mã OTP
    await this.otpService.verifyOtp(normalizedEmail, dto.code, OtpType.REGISTER_VERIFY);

    // Kích hoạt người dùng
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundException(this.i18nService.t('users.not_found', locale));
    }

    const updatedUser = await this.usersService.update(user.id, {
      isEmailVerified: true,
    });

    // Tự động đăng nhập
    return this.login(updatedUser, response, locale);
  }

  /**
   * Gửi lại mã OTP
   */
  async resendOtp(
    email: string,
    type: OtpType,
    locale?: string,
  ): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase();
    await this.otpService.createAndSendOtp(normalizedEmail, type, undefined, locale);
    return {
      success: true,
      message: this.i18nService.t('auth.otp_resent', locale),
    };
  }

  /**
   * Đăng nhập / Đăng ký qua Google OAuth ủy quyền trực tiếp tới Central Gateway Master IAM
   */
  async loginWithGoogle(
    dto: GoogleLoginDto,
    response: Response,
    locale?: string,
  ): Promise<{ message: string; user: UserProfileDto }> {
    let email = dto.email?.toLowerCase();
    let name = dto.name;
    let googleId = dto.googleId;

    if (dto.credential && (!email || !googleId)) {
      try {
        const decoded = this.jwtService.decode(dto.credential) as Record<string, unknown> | null;
        if (decoded) {
          if (typeof decoded.email === 'string') email = decoded.email.toLowerCase();
          if (typeof decoded.name === 'string') name = decoded.name;
          if (typeof decoded.sub === 'string') googleId = decoded.sub;
        }
      } catch {
        // ignore
      }
    }

    if (!email) {
      throw new BadRequestException('Không thể trích xuất địa chỉ email từ tài khoản Google.');
    }

    if (!this.s2sService) {
      throw new BadRequestException('Dịch vụ xác thực Central Gateway chưa được khởi tạo.');
    }

    const gwRes = await this.s2sService.call<{
      user: {
        id: string;
        username: string;
        email?: string | null;
        role: string;
        avatarUrl?: string | null;
        isActive?: boolean;
      };
    }>('central-gateway', '/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        email,
        name,
        googleId,
        credential: dto.credential,
      }),
    });

    if (!gwRes?.user) {
      throw new UnauthorizedException('Xác thực tài khoản Google qua Central Gateway thất bại.');
    }

    const gwUser = gwRes.user;
    if (gwUser.isActive === false) {
      const msg = this.i18nService.t('auth.account_disabled', locale);
      throw new UnauthorizedException(msg);
    }

    const safeUser = await this.syncLocalUser({
      ...gwUser,
      googleId: googleId || `google_${Date.now()}`,
    });

    return this.login(safeUser, response, locale);
  }

  /**
   * Đồng bộ hoặc khởi tạo người dùng cục bộ từ danh tính Central Gateway Master IAM
   */
  private async syncLocalUser(gwUser: {
    id: string;
    username: string;
    email?: string | null;
    role?: string;
    avatarUrl?: string | null;
    isActive?: boolean;
    googleId?: string | null;
  }): Promise<SafeUser> {
    const role = gwUser.role === 'ADMIN' ? Role.ADMIN : Role.USER;

    let existing = await this.prisma.user.findUnique({
      where: { id: gwUser.id },
    });

    if (!existing && gwUser.username) {
      existing = await this.prisma.user.findUnique({
        where: { username: gwUser.username },
      });
    }

    if (!existing && gwUser.email) {
      existing = await this.prisma.user.findUnique({
        where: { email: gwUser.email },
      });
    }

    let user;
    if (existing) {
      user = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          username: gwUser.username,
          email: gwUser.email ?? null,
          role,
          avatarUrl: gwUser.avatarUrl ?? existing.avatarUrl,
          isActive: gwUser.isActive ?? existing.isActive,
          isEmailVerified: true,
          ...(gwUser.googleId ? { googleId: gwUser.googleId } : {}),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          id: gwUser.id,
          username: gwUser.username,
          email: gwUser.email ?? null,
          role,
          avatarUrl: gwUser.avatarUrl ?? null,
          isActive: gwUser.isActive ?? true,
          isEmailVerified: true,
          ...(gwUser.googleId ? { googleId: gwUser.googleId } : {}),
        },
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Yêu cầu khôi phục mật khẩu (Gửi OTP 6 số)
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
    locale?: string,
  ): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      await this.otpService.createAndSendOtp(
        normalizedEmail,
        OtpType.RESET_PASSWORD,
        user.id,
        locale,
      );
    }

    const resolvedLocale = this.i18nService.resolveLocale(locale);
    const msg =
      resolvedLocale === 'en'
        ? 'If the email exists in our system, a 6-digit verification code has been sent.'
        : 'Nếu email tồn tại trong hệ thống, mã xác thực 6 số đã được gửi.';

    // Trả về thông báo thành công chung để chống rò rỉ danh tính (Anti-enumeration)
    return {
      success: true,
      message: msg,
    };
  }

  /**
   * Đặt lại mật khẩu bằng mã OTP 6 số
   */
  async resetPassword(
    dto: ResetPasswordDto,
    locale?: string,
  ): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = dto.email.toLowerCase();

    // Xác thực mã OTP
    await this.otpService.verifyOtp(normalizedEmail, dto.code, OtpType.RESET_PASSWORD);

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundException(this.i18nService.t('users.not_found', locale));
    }

    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
    });

    await this.usersService.update(user.id, {
      passwordHash,
      isEmailVerified: true,
    });

    return {
      success: true,
      message: this.i18nService.t('auth.password_reset_success', locale),
    };
  }

  /**
   * Đổi mật khẩu cho người dùng đã đăng nhập
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    locale?: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(this.i18nService.t('users.not_found', locale));
    }

    // Nếu tài khoản đã có mật khẩu thì bắt buộc kiểm tra currentPassword
    if (user.passwordHash) {
      if (!dto.currentPassword) {
        const msg =
          this.i18nService.resolveLocale(locale) === 'en'
            ? 'Please provide your current password.'
            : 'Vui lòng cung cấp mật khẩu hiện tại.';
        throw new BadRequestException({
          message: msg,
          errors: { currentPassword: [msg] },
        });
      }
      const isMatch = await argon2.verify(user.passwordHash, dto.currentPassword);
      if (!isMatch) {
        const msg = this.i18nService.t('auth.old_password_incorrect', locale);
        throw new BadRequestException({
          message: msg,
          errors: { currentPassword: [msg] },
        });
      }
    }

    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
    });

    await this.usersService.update(userId, { passwordHash });

    return {
      success: true,
      message: this.i18nService.t('auth.password_changed_success', locale),
    };
  }

  /**
   * Thiết lập mật khẩu cho tài khoản Google chưa có mật khẩu
   */
  async setPassword(
    userId: string,
    dto: SetPasswordDto,
    locale?: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(this.i18nService.t('users.not_found', locale));
    }

    if (user.passwordHash) {
      const msg = this.i18nService.t('auth.password_already_set', locale);
      throw new BadRequestException({
        message: msg,
        errors: { newPassword: [msg] },
      });
    }

    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
    });

    await this.usersService.update(userId, { passwordHash });

    return {
      success: true,
      message: this.i18nService.t('auth.password_set_success', locale),
    };
  }

  /**
   * Lấy thông tin hồ sơ chi tiết của người dùng
   */
  async getDetailedProfile(safeUser: SafeUser): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({ where: { id: safeUser.id } });
    return {
      ...safeUser,
      hasPassword: user ? user.passwordHash !== null : false,
      isGoogleLinked: user ? user.googleId !== null : false,
      isEmailVerified: user ? user.isEmailVerified : safeUser.isEmailVerified,
      avatarUrl: user ? user.avatarUrl : safeUser.avatarUrl,
    };
  }

  /**
   * Logout user by clearing HttpOnly session cookie
   */
  logout(response: Response): { success: boolean; message: string } {
    const isProduction = process.env.NODE_ENV === 'production';

    response.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
      message: 'Đăng xuất thành công',
    };
  }
}
