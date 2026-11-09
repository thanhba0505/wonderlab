import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsEmailIfProd } from './validation-helpers';

export class ResendOtpDto {
  @ApiProperty({
    example: 'user@wonderlab.local',
    description: 'Địa chỉ email cần nhận lại mã xác thực',
  })
  @IsEmailIfProd({ message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  email!: string;

  @ApiProperty({
    example: 'REGISTER_VERIFY',
    description: 'Loại mã xác thực',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}
