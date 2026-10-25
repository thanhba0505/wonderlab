import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
import { SafeUser, UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  username: string;
  role: Role;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const isProd = configService.get<string>('NODE_ENV') === 'production';
    const secret = configService.get<string>('JWT_SECRET');

    if (
      isProd &&
      (!secret || secret === 'wonderlab_dev_jwt_secret_change_in_production_32chars_min')
    ) {
      throw new Error(
        'FATAL: JWT_SECRET environment variable must be set in production mode and cannot use dev default.',
      );
    }

    const resolvedSecret = secret || 'wonderlab_dev_jwt_secret_change_in_production_32chars_min';

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Primary: Extract from HttpOnly Cookie
        (request: Request) => {
          return request?.cookies?.access_token ?? null;
        },
        // 2. Fallback: Extract from Authorization Bearer header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: resolvedSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<SafeUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc phiên đăng nhập không hợp lệ');
    }

    return user;
  }
}
