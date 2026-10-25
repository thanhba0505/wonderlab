import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
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
    enum: OtpType,
    example: OtpType.REGISTER_VERIFY,
    description: 'Loại mã xác thực',
  })
  @IsEnum(OtpType, { message: 'Loại mã xác thực không hợp lệ' })
  type!: OtpType;
}
