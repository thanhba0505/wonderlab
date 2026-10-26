import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto, SetPasswordDto } from './dto/change-password.dto';
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
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(dto, acceptLanguage);
    return this.authService.login(user, response, acceptLanguage);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới',
    description: 'Tạo tài khoản và gửi mã xác thực OTP 6 số đến email',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Đăng ký thành công, mã OTP đã gửi đến email',
  })
  async register(@Body() dto: RegisterDto, @Headers('accept-language') acceptLanguage?: string) {
    return this.authService.register(dto, acceptLanguage);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xác thực email bằng mã OTP 6 số',
    description: 'Kích hoạt tài khoản và tự động đăng nhập cấp cookie',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xác thực thành công và đã đăng nhập',
    type: LoginResponseDto,
  })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<LoginResponseDto> {
    return this.authService.verifyEmail(dto, response, acceptLanguage);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gửi lại mã OTP (Giới hạn giãn cách 60 giây)',
    description: 'Tạo và gửi mã OTP mới nếu đã quá 60s kể từ lần gửi trước',
  })
  async resendOtp(@Body() dto: ResendOtpDto, @Headers('accept-language') acceptLanguage?: string) {
    return this.authService.resendOtp(dto.email, dto.type, acceptLanguage);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập / Đăng ký qua Google OAuth',
    description:
      'Tự động đăng ký hoặc liên kết tài khoản nếu cùng email, đồng thời cấp session cookie',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng nhập Google thành công',
    type: LoginResponseDto,
  })
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<LoginResponseDto> {
    return this.authService.loginWithGoogle(dto, response, acceptLanguage);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quên mật khẩu (Gửi mã OTP 6 số)',
    description: 'Gửi mã xác thực đặt lại mật khẩu qua email',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.authService.forgotPassword(dto, acceptLanguage);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đặt lại mật khẩu với mã OTP 6 số',
    description: 'Xác thực mã 6 số và cập nhật mật khẩu mới',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.authService.resetPassword(dto, acceptLanguage);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Đổi mật khẩu cho người dùng hiện tại',
    description: 'Yêu cầu mật khẩu hiện tại nếu tài khoản đã có mật khẩu',
  })
  async changePassword(
    @CurrentUser() user: SafeUser,
    @Body() dto: ChangePasswordDto,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.authService.changePassword(user.id, dto, acceptLanguage);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Thiết lập mật khẩu cho tài khoản Google chưa có mật khẩu',
    description: 'Cho phép người dùng Google tạo mật khẩu để có thể đăng nhập bằng email',
  })
  async setPassword(
    @CurrentUser() user: SafeUser,
    @Body() dto: SetPasswordDto,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.authService.setPassword(user.id, dto, acceptLanguage);
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
  async getMe(@CurrentUser() user: SafeUser): Promise<UserProfileDto> {
    return this.authService.getDetailedProfile(user);
  }
}
