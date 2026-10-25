import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsEmailIfProd } from './validation-helpers';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'student_alex@example.com',
    description: 'Địa chỉ email đã đăng ký',
  })
  @IsEmailIfProd({ message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  email!: string;

  @ApiProperty({
    example: '849201',
    description: 'Mã xác thực OTP gồm 6 chữ số được gửi qua email',
  })
  @IsString({ message: 'Mã xác thực phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã xác thực không được để trống' })
  @Length(6, 6, { message: 'Mã xác thực phải đúng 6 chữ số' })
  code!: string;
}
