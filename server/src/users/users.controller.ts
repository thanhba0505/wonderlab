import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService, SafeUser, PaginatedUsersResult } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users & Identity')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth('access_token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cập nhật thông tin cá nhân (Username hoặc Email)',
    description:
      'Người dùng tự đổi tên người dùng hoặc email, tự động đồng bộ sang Central Gateway IAM.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thông tin thành công',
  })
  async updateMyProfile(
    @CurrentUser() currentUser: SafeUser,
    @Body() dto: UpdateMyProfileDto,
  ): Promise<SafeUser> {
    return this.usersService.updateProfile(currentUser.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cập nhật vai trò người dùng (Admin only)',
    description: 'Thay đổi quyền hạn giữa USER và ADMIN, đồng bộ sang Central Gateway Master IAM.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật vai trò thành công',
  })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() currentUser: SafeUser,
  ): Promise<SafeUser> {
    return this.usersService.updateRole(id, dto.role, currentUser.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bật/tắt trạng thái hoạt động người dùng (Admin only)',
    description:
      'Kích hoạt hoặc vô hiệu hóa tài khoản người dùng, đồng bộ sang Central Gateway Master IAM.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật trạng thái thành công',
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() currentUser: SafeUser,
  ): Promise<SafeUser> {
    return this.usersService.updateStatus(id, dto.isActive, currentUser.id);
  }
}
