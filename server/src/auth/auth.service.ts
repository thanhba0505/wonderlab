import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as argon2 from 'argon2';
import { OtpType, Role } from '@prisma/client';
import { SafeUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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

const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRmb3JkdW1teQ$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly prisma: PrismaService,
    private readonly i18nService: I18nService = new I18nService(),
  ) {}

  /**
   * Validate user credentials against Argon2 hash with timing attack defense
   */
  async validateUser(dto: LoginDto, locale?: string): Promise<SafeUser> {
    const user = await this.usersService.findByIdentifierWithHash(dto.username);

    // If user doesn't exist, verify against dummy hash to equalize processing time
    if (!user) {
      await argon2.verify(DUMMY_HASH, dto.password).catch(() => false);
      const msg = this.i18nService.t('auth.invalid_credentials', locale);
      throw new UnauthorizedException({
        message: msg,
        errors: { password: [msg] },
      });
    }

    if (!user.passwordHash) {
      const msg = this.i18nService.t('auth.google_account_only', locale);
      throw new UnauthorizedException({
        message: msg,
        errors: {
          username: [msg],
        },
      });
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      const msg = this.i18nService.t('auth.invalid_credentials', locale);
      throw new UnauthorizedException({
        message: msg,
        errors: { password: [msg] },
      });
    }

    if (user.isDeleted) {
      const msg = this.i18nService.t('auth.account_disabled', locale);
      throw new UnauthorizedException({
        message: msg,
        errors: { username: [msg] },
      });
    }

    if (!user.isEmailVerified && user.role !== Role.ADMIN) {
      const msg = this.i18nService.t('auth.email_not_verified', locale);
      throw new UnauthorizedException({
        message: msg,
        errors: {
          username: [msg],
        },
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
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
   * Đăng ký tài khoản người dùng mới & gửi mã OTP 6 số
   */
  async register(
    dto: RegisterDto,
    locale?: string,
  ): Promise<{ message: string; email: string; requireOtp: boolean }> {
    const normalizedEmail = dto.email.toLowerCase();

    // Kiểm tra email đã đăng ký chưa
    const existingByEmail = await this.usersService.findByEmail(normalizedEmail);
    if (existingByEmail) {
      const msg = this.i18nService.t('auth.email_exists', locale);
      throw new BadRequestException({
        message: msg,
        errors: { email: [msg] },
      });
    }

    // Kiểm tra username đã đăng ký chưa
    const existingByUsername = await this.usersService.findByUsername(dto.username);
    if (existingByUsername) {
      const msg = this.i18nService.t('auth.username_exists', locale);
      throw new BadRequestException({
        message: msg,
        errors: { username: [msg] },
      });
    }

    // Hash mật khẩu qua Argon2id
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    // Tạo tài khoản với trạng thái chưa xác thực email
    const newUser = await this.usersService.create({
      username: dto.username,
      email: normalizedEmail,
      passwordHash,
      role: Role.USER,
      isEmailVerified: false,
    });

    // Phát sinh & gửi mã OTP 6 số
    const { code } = await this.otpService.createAndSendOtp(
      normalizedEmail,
      OtpType.REGISTER_VERIFY,
      newUser.id,
      locale,
    );

    const resolvedLocale = this.i18nService.resolveLocale(locale);
    const successMsg =
      resolvedLocale === 'en'
        ? 'Registration successful. Please enter the 6-digit verification code sent to your email.'
        : 'Đăng ký thành công. Vui lòng nhập mã OTP 6 số gửi đến email của bạn để kích hoạt.';

    return {
      message: successMsg,
      email: normalizedEmail,
      requireOtp: true,
      ...(process.env.NODE_ENV !== 'production' ? { devOtpCode: code } : {}),
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
   * Đăng nhập / Đăng ký qua Google OAuth kèm liên kết tài khoản cùng email
   */
  async loginWithGoogle(
    dto: GoogleLoginDto,
    response: Response,
    locale?: string,
  ): Promise<{ message: string; user: UserProfileDto }> {
    // Trích xuất thông tin Google từ credential hoặc payload dev
    let email = dto.email?.toLowerCase();
    let name = dto.name;
    let googleId = dto.googleId;

    // Phân tích JWT token nếu truyền qua credential chuẩn Google ID token
    if (dto.credential && (!email || !googleId)) {
      try {
        const decoded = this.jwtService.decode(dto.credential) as Record<string, unknown> | null;
        if (decoded) {
          if (typeof decoded.email === 'string') email = decoded.email.toLowerCase();
          if (typeof decoded.name === 'string') name = decoded.name;
          if (typeof decoded.sub === 'string') googleId = decoded.sub;
        }
      } catch {
        // Fallback
      }
    }

    if (!email) {
      throw new BadRequestException('Không thể trích xuất địa chỉ email từ tài khoản Google.');
    }

    // 1. Kiểm tra xem đã có người dùng với email này chưa (Tự động liên kết tài khoản)
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      // Đã có tài khoản: Cập nhật googleId nếu chưa liên kết, và đảm bảo isEmailVerified = true
      const updatedUser = await this.usersService.update(existingUser.id, {
        googleId: existingUser.googleId || googleId || `google_${Date.now()}`,
        isEmailVerified: true,
      });

      return this.login(updatedUser, response, locale);
    }

    // 2. Nếu chưa có tài khoản: Tạo mới tự động
    const baseUsername =
      (name ? name.replace(/\s+/g, '_').toLowerCase() : email.split('@')[0])
        .replace(/[^a-zA-Z0-9_]/g, '')
        .slice(0, 20) || 'user';

    let uniqueUsername = baseUsername;
    let counter = 1;
    while (await this.usersService.findByUsername(uniqueUsername)) {
      uniqueUsername = `${baseUsername}_${counter++}`;
    }

    const newUser = await this.usersService.create({
      email,
      username: uniqueUsername,
      googleId: googleId || `google_${Date.now()}`,
      isEmailVerified: true,
      passwordHash: undefined, // Tài khoản Google chưa có mật khẩu
      role: Role.USER,
    });

    return this.login(newUser, response, locale);
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
