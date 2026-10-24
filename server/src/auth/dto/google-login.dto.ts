import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiPropertyOptional({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
    description: 'Google ID token (credential) nhận từ Google Identity Services',
  })
  @IsOptional()
  @IsString()
  credential?: string;

  @ApiPropertyOptional({
    description: 'Email (hỗ trợ môi trường local test)',
    example: 'researcher@gmail.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Họ tên người dùng từ Google',
    example: 'Alex Nguyen',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Google Subject ID',
    example: 'google_sub_10928301928301298',
  })
  @IsOptional()
  @IsString()
  googleId?: string;
}
