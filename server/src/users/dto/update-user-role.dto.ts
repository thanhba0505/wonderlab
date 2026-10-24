import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
    description: 'Vai trò mới của người dùng (ADMIN hoặc USER)',
  })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsEnum(Role, { message: 'Vai trò phải là ADMIN hoặc USER' })
  role!: Role;
}
