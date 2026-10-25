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

const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRmb3JkdW1teQ$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Validate user credentials against Argon2 hash with timing attack defense
   */
  async validateUser(dto: LoginDto): Promise<SafeUser> {
    const user = await this.usersService.findByIdentifierWithHash(dto.username);

    // If user doesn't exist, verify against dummy hash to equalize processing time
    if (!user) {
      await argon2.verify(DUMMY_HASH, dto.password).catch(() => false);
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Tài khoản này được đăng ký qua Google. Vui lòng đăng nhập bằng Google hoặc thiết lập mật khẩu.',
      );
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('Tài khoản này đã bị vô hiệu hóa hoặc đã xóa.');
    }

    if (!user.isEmailVerified && user.role !== Role.ADMIN) {
      throw new UnauthorizedException(
        'Email của bạn chưa được xác thực. Vui lòng nhập mã OTP 6 số để kích hoạt tài khoản.',
      );
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

    return {
      message: 'Đăng nhập thành công',
      user: detailedUser,
    };
  }

  /**
   * Đăng ký tài khoản người dùng mới & gửi mã OTP 6 số
   */
  async register(
    dto: RegisterDto,
  ): Promise<{ message: string; email: string; requireOtp: boolean }> {
    const normalizedEmail = dto.email.toLowerCase();

    // Kiểm tra email đã đăng ký chưa
    const existingByEmail = await this.usersService.findByEmail(normalizedEmail);
    if (existingByEmail) {
      throw new BadRequestException('Địa chỉ email này đã được sử dụng.');
    }

    // Kiểm tra username đã đăng ký chưa
    const existingByUsername = await this.usersService.findByUsername(dto.username);
    if (existingByUsername) {
      throw new BadRequestException('Tên đăng nhập này đã được sử dụng.');
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
    );

    return {
      message: 'Đăng ký thành công. Vui lòng nhập mã OTP 6 số gửi đến email của bạn để kích hoạt.',
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
  ): Promise<{ message: string; user: UserProfileDto }> {
    const normalizedEmail = dto.email.toLowerCase();

    // Xác thực mã OTP
    await this.otpService.verifyOtp(normalizedEmail, dto.code, OtpType.REGISTER_VERIFY);

    // Kích hoạt người dùng
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    const updatedUser = await this.usersService.update(user.id, {
      isEmailVerified: true,
    });

    // Tự động đăng nhập
    return this.login(updatedUser, response);
  }

  /**
   * Gửi lại mã OTP
   */
  async resendOtp(email: string, type: OtpType): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase();
    await this.otpService.createAndSendOtp(normalizedEmail, type);
    return {
      success: true,
      message: 'Mã xác thực mới đã được gửi đến email của bạn.',
    };
  }

  /**
   * Đăng nhập / Đăng ký qua Google OAuth kèm liên kết tài khoản cùng email
   */
  async loginWithGoogle(
    dto: GoogleLoginDto,
    response: Response,
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

      return this.login(updatedUser, response);
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

    return this.login(newUser, response);
  }

  /**
   * Yêu cầu khôi phục mật khẩu (Gửi OTP 6 số)
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      await this.otpService.createAndSendOtp(normalizedEmail, OtpType.RESET_PASSWORD, user.id);
    }

    // Trả về thông báo thành công chung để chống rò rỉ danh tính (Anti-enumeration)
    return {
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, mã xác thực 6 số đã được gửi.',
    };
  }

  /**
   * Đặt lại mật khẩu bằng mã OTP 6 số
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = dto.email.toLowerCase();

    // Xác thực mã OTP
    await this.otpService.verifyOtp(normalizedEmail, dto.code, OtpType.RESET_PASSWORD);

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
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
      message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập ngay.',
    };
  }

  /**
   * Đổi mật khẩu cho người dùng đã đăng nhập
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    // Nếu tài khoản đã có mật khẩu thì bắt buộc kiểm tra currentPassword
    if (user.passwordHash) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Vui lòng cung cấp mật khẩu hiện tại.');
      }
      const isMatch = await argon2.verify(user.passwordHash, dto.currentPassword);
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu hiện tại không chính xác.');
      }
    }

    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
    });

    await this.usersService.update(userId, { passwordHash });

    return {
      success: true,
      message: 'Đổi mật khẩu thành công.',
    };
  }

  /**
   * Thiết lập mật khẩu cho tài khoản Google chưa có mật khẩu
   */
  async setPassword(
    userId: string,
    dto: SetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    if (user.passwordHash) {
      throw new BadRequestException(
        'Tài khoản này đã có mật khẩu cá nhân. Vui lòng sử dụng chức năng Đổi mật khẩu.',
      );
    }

    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
    });

    await this.usersService.update(userId, { passwordHash });

    return {
      success: true,
      message: 'Thiết lập mật khẩu thành công. Giờ bạn có thể đăng nhập bằng cả Email và Google.',
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
