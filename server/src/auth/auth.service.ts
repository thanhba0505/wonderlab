import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as argon2 from 'argon2';
import { SafeUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

// Dummy hash used to equalize execution timing when username is not found (anti-timing attack)
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRmb3JkdW1teQ$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials against Argon2 hash with timing attack defense
   */
  async validateUser(dto: LoginDto): Promise<SafeUser> {
    const user = await this.usersService.findByUsernameWithHash(dto.username);

    // If user doesn't exist, verify against dummy hash to equalize processing time
    if (!user) {
      await argon2.verify(DUMMY_HASH, dto.password).catch(() => false);
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Login user and issue HttpOnly cookie
   */
  async login(user: SafeUser, response: Response): Promise<{ message: string; user: SafeUser }> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    const isProduction = process.env.NODE_ENV === 'production';

    // 7 days in milliseconds
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
    });

    return {
      message: 'Đăng nhập thành công',
      user,
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
