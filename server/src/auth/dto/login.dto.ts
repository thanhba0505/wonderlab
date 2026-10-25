import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { MinLengthIfProd } from './validation-helpers';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username for authentication',
    minLength: 1,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(64)
  username!: string;

  @ApiProperty({
    example: 'Admin@Wonderlab2026!',
    description: 'Account password',
    minLength: 1,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MinLengthIfProd(8)
  @MaxLength(128)
  password!: string;
}
