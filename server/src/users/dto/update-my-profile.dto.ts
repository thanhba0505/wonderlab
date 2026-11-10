import { IsString, IsOptional, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({ example: 'science_lover', description: 'Tên người dùng mới' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Tên người dùng tối thiểu 3 ký tự' })
  @MaxLength(30, { message: 'Tên người dùng tối đa 30 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'user@wonderlab.local', description: 'Địa chỉ email mới' })
  @IsOptional()
  @IsEmail({}, { message: 'Địa chỉ email không hợp lệ' })
  email?: string;
}
