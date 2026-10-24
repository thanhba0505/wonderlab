import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@wonderlab.local',
    description: 'Email tài khoản cần đặt lại mật khẩu',
  })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({
    example: '520194',
    description: 'Mã xác thực OTP 6 số nhận qua email',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mã xác thực không được để trống' })
  @Length(6, 6, { message: 'Mã xác thực phải đúng 6 chữ số' })
  code!: string;

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
