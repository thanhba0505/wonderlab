import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    example: 'user@wonderlab.local',
    description: 'Địa chỉ email cần nhận lại mã xác thực',
  })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({
    enum: OtpType,
    example: OtpType.REGISTER_VERIFY,
    description: 'Loại mã xác thực',
  })
  @IsEnum(OtpType, { message: 'Loại mã xác thực không hợp lệ' })
  type!: OtpType;
}
