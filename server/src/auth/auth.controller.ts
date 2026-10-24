import { Controller, Post, Get, Body, Res, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, LogoutResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SafeUser } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập hệ thống (Cấp phát HttpOnly Cookie)',
    description:
      'Xác thực tài khoản và cấp phát token JWT qua HttpOnly cookie an toàn (tối đa 5 lần thử/phút chống Brute-force).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng nhập thành công, cookie access_token đã được thiết lập',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Tên đăng nhập hoặc mật khẩu không chính xác',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Quá nhiều lần thử đăng nhập thất bại. Vui lòng thử lại sau 1 phút.',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(dto);
    return this.authService.login(user, response);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng xuất hệ thống',
    description: 'Xóa HttpOnly cookie access_token khỏi trình duyệt',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng xuất thành công',
    type: LogoutResponseDto,
  })
  logout(@Res({ passthrough: true }) response: Response): LogoutResponseDto {
    return this.authService.logout(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Lấy thông tin người dùng hiện tại',
    description: 'Yêu cầu session cookie hợp lệ hoặc Bearer token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin hồ sơ người dùng đang đăng nhập',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn',
  })
  getMe(@CurrentUser() user: SafeUser): UserProfileDto {
    return user;
  }
}
