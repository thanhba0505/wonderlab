import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsEmailIfProd } from './validation-helpers';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@wonderlab.local',
    description: 'Email tài khoản cần khôi phục mật khẩu',
  })
  @IsEmailIfProd({ message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  email!: string;
}
