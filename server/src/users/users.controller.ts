import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService, UserWithStats, SafeUser } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin - Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth('access_token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách người dùng hệ thống (Admin only)',
    description: 'Trả về toàn bộ người dùng kèm số liệu thống kê lượt chạy và bình luận.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách người dùng và thống kê hoạt động',
  })
  async getAllUsers(): Promise<UserWithStats[]> {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cập nhật vai trò người dùng (Admin only)',
    description: 'Thay đổi quyền hạn giữa USER và ADMIN.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật vai trò thành công',
  })
  async updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto): Promise<SafeUser> {
    return this.usersService.updateRole(id, dto.role);
  }
}
