import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiPropertyOptional({
    example: 'OldPassword123!',
    description: 'Mật khẩu hiện tại (bỏ trống nếu tài khoản tạo qua Google chưa có mật khẩu)',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({
    example: 'NewSecurePassword2026!',
    description: 'Mật khẩu mới (tối thiểu 8 ký tự)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(8, { message: 'Mật khẩu mới tối thiểu 8 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu mới tối đa 100 ký tự' })
  newPassword!: string;
}

export class SetPasswordDto {
  @ApiProperty({
    example: 'NewSecurePassword2026!',
    description: 'Mật khẩu thiết lập cho tài khoản Google chưa có mật khẩu',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu tối đa 100 ký tự' })
  newPassword!: string;
}
