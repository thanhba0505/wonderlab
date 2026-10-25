import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService, UserWithStats, SafeUser, PaginatedUsersResult } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin - Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth('access_token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách người dùng hệ thống phân trang và tìm kiếm (Admin only)',
    description:
      'Trả về danh sách người dùng (mặc định 20 bản ghi/trang) kèm số liệu thống kê lượt chạy và bình luận.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách người dùng phân trang và thống kê hoạt động',
  })
  async getAllUsers(@Query() query: ListUsersQueryDto): Promise<PaginatedUsersResult> {
    return this.usersService.findAll(query);
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa tài khoản người dùng (Admin only)',
    description: 'Chuyển trạng thái người dùng thành đã xóa (Soft Delete).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa người dùng thành công',
  })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: SafeUser,
  ): Promise<{ success: boolean; message: string }> {
    return this.usersService.delete(id, currentUser.id);
  }
}
