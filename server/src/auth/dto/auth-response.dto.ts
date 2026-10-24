import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserProfileDto {
  @ApiProperty({
    example: 'cd0ad32d-bfb0-4819-9ba1-e5e6e3c7db34',
    description: 'Unique user identifier (UUID)',
  })
  id!: string;

  @ApiProperty({
    example: 'admin',
    description: 'Username',
  })
  username!: string;

  @ApiProperty({
    example: 'admin@wonderlab.local',
    description: 'User email address',
    nullable: true,
  })
  email!: string | null;

  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
    description: 'User permission role',
  })
  role!: Role;

  @ApiProperty({
    example: true,
    description: 'Email verified status',
  })
  isEmailVerified!: boolean;

  @ApiProperty({
    example: true,
    description: 'Tài khoản đã có mật khẩu cá nhân hay chưa',
  })
  hasPassword!: boolean;

  @ApiProperty({
    example: false,
    description: 'Tài khoản đã liên kết với Google OAuth',
  })
  isGoogleLinked!: boolean;

  @ApiProperty({
    example: 'https://lh3.googleusercontent.com/...',
    description: 'User avatar URL',
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiProperty({
    example: '2026-10-24T09:11:16.571Z',
    description: 'Account creation ISO timestamp',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-10-24T09:11:16.571Z',
    description: 'Account last update ISO timestamp',
  })
  updatedAt!: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'Đăng nhập thành công',
    description: 'Human-readable status message',
  })
  message!: string;

  @ApiProperty({
    type: UserProfileDto,
    description: 'Authenticated user profile',
  })
  user!: UserProfileDto;
}

export class LogoutResponseDto {
  @ApiProperty({
    example: true,
    description: 'Logout success indicator',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Đăng xuất thành công',
    description: 'Human-readable status message',
  })
  message!: string;
}
