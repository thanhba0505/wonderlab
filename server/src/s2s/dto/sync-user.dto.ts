import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SyncUserDto {
  @ApiProperty({ description: 'Central Gateway User UUID' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiPropertyOptional({ description: 'User email address' })
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'User system role (ADMIN | USER)' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: 'Active status' })
  @IsBoolean()
  isActive!: boolean;
}
