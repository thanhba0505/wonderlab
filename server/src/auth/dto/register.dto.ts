import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'student_alex@example.com',
    description: 'Địa chỉ email người dùng (dùng để nhận mã xác thực 6 số)',
  })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({
    example: 'alex_quantum',
    description: 'Tên đăng nhập (chữ cái, chữ số và dấu gạch dưới, 3-30 ký tự)',
  })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @MinLength(3, { message: 'Tên đăng nhập tối thiểu 3 ký tự' })
  @MaxLength(30, { message: 'Tên đăng nhập tối đa 30 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Tên đăng nhập chỉ được chứa chữ cái, chữ số và dấu gạch dưới (_)',
  })
  username!: string;

  @ApiProperty({
    example: 'QuantumLab2026!',
    description: 'Mật khẩu bảo mật (tối thiểu 8 ký tự)',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu tối thiểu phải có 8 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu tối đa 100 ký tự' })
  password!: string;
}
