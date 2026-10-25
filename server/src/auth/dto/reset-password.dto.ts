import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
import { IsEmailIfProd, MinLengthIfProd } from './validation-helpers';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@wonderlab.local',
    description: 'Email tài khoản cần đặt lại mật khẩu',
  })
  @IsEmailIfProd({ message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
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
  @MinLengthIfProd(8, { message: 'Mật khẩu mới tối thiểu 8 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu mới tối đa 100 ký tự' })
  newPassword!: string;
}
