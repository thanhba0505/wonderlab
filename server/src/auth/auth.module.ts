import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
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

        const resolvedSecret =
          secret || 'wonderlab_dev_jwt_secret_change_in_production_32chars_min';
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') || '7d') as
          number | `${number}${'s' | 'm' | 'h' | 'd'}`;

        return {
          secret: resolvedSecret,
          signOptions: {
            expiresIn,
            algorithm: 'HS256',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtStrategy, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
  exports: [AuthService, OtpService, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
})
export class AuthModule {}
