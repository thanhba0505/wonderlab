import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SimulationRequestsService } from './simulation-requests.service';
import { CreateSimulationRequestDto } from './dto/create-simulation-request.dto';
import { QuerySimulationRequestsDto } from './dto/query-simulation-requests.dto';
import { UpdateSimulationRequestStatusDto } from './dto/update-simulation-request-status.dto';
import {
  SimulationRequestItemDto,
  PaginatedSimulationRequestsDto,
  ToggleVoteResponseDto,
} from './dto/simulation-request-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SafeUser } from '../users/users.service';

@ApiTags('Simulation Requests')
@Controller()
export class SimulationRequestsController {
  constructor(private readonly simulationRequestsService: SimulationRequestsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post('simulation-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Gửi đề xuất bài toán / thí nghiệm mô phỏng mới',
    description:
      'Cho phép cả người dùng đã đăng nhập hoặc khách vãng lai gửi đề xuất thí nghiệm. Tự động gắn 1 lượt vote ban đầu cho người tạo.',
  })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Mã phiên trình duyệt ẩn danh (dành cho khách)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo đề xuất thí nghiệm thành công',
    type: SimulationRequestItemDto,
  })
  async createRequest(
    @Body() dto: CreateSimulationRequestDto,
    @CurrentUser() currentUser?: SafeUser,
    @Headers('x-session-id') sessionHeader?: string,
  ): Promise<SimulationRequestItemDto> {
    const effectiveSession = dto.clientSession || sessionHeader;
    return this.simulationRequestsService.create(dto, currentUser?.id, effectiveSession);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('simulation-requests')
  @ApiOperation({
    summary: 'Lấy danh sách đề xuất thí nghiệm công khai',
    description:
      'Trả về danh sách đề xuất có phân trang, bộ lọc danh mục/trạng thái và sắp xếp theo lượt vote hoặc ngày tạo.',
  })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Mã phiên trình duyệt ẩn danh (dành cho khách)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách đề xuất phân trang',
    type: PaginatedSimulationRequestsDto,
  })
  async getAllRequests(
    @Query() query: QuerySimulationRequestsDto,
    @CurrentUser() currentUser?: SafeUser,
    @Headers('x-session-id') sessionHeader?: string,
  ): Promise<PaginatedSimulationRequestsDto> {
    const effectiveSession = query.clientSession || sessionHeader;
    return this.simulationRequestsService.findAll(query, currentUser?.id, effectiveSession);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('simulation-requests/:id')
  @ApiOperation({
    summary: 'Lấy chi tiết một đề xuất thí nghiệm',
    description: 'Xem thông tin chi tiết của một đề xuất cụ thể.',
  })
  @ApiParam({ name: 'id', description: 'Mã UUID của đề xuất' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin chi tiết đề xuất',
    type: SimulationRequestItemDto,
  })
  async getRequestById(
    @Param('id') id: string,
    @CurrentUser() currentUser?: SafeUser,
    @Headers('x-session-id') sessionHeader?: string,
  ): Promise<SimulationRequestItemDto> {
    return this.simulationRequestsService.findById(id, currentUser?.id, sessionHeader);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('simulation-requests/:id/vote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bình chọn hoặc hủy bình chọn (Toggle Upvote) cho đề xuất',
    description:
      'Bấm lần 1 để Upvote, bấm lần 2 để hủy vote. Hỗ trợ tài khoản đăng nhập hoặc mã phiên khách.',
  })
  @ApiParam({ name: 'id', description: 'Mã UUID của đề xuất' })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Mã phiên trình duyệt ẩn danh (dành cho khách)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật lượt bình chọn thành công',
    type: ToggleVoteResponseDto,
  })
  async toggleVote(
    @Param('id') id: string,
    @Body('clientSession') bodySession?: string,
    @CurrentUser() currentUser?: SafeUser,
    @Headers('x-session-id') sessionHeader?: string,
  ): Promise<ToggleVoteResponseDto> {
    const effectiveSession = bodySession || sessionHeader;
    return this.simulationRequestsService.toggleVote(id, currentUser?.id, effectiveSession);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/simulation-requests')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Lấy danh sách đề xuất phục vụ quản trị và thẩm định (Admin only)',
    description:
      'Trả về danh sách đề xuất đầy đủ thông tin (kèm email người gửi nếu có) để ban biên tập thẩm định.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách đề xuất cho quản trị viên',
    type: PaginatedSimulationRequestsDto,
  })
  async getAllForAdmin(
    @Query() query: QuerySimulationRequestsDto,
  ): Promise<PaginatedSimulationRequestsDto> {
    return this.simulationRequestsService.findAllForAdmin(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/simulation-requests/:id/status')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Cập nhật trạng thái và phản hồi ban biên tập (Admin only)',
    description:
      'Cập nhật trạng thái (UNDER_REVIEW, PLANNED, IN_DEVELOPMENT, COMPLETED, REJECTED) kèm ghi chú và slug mô phỏng.',
  })
  @ApiParam({ name: 'id', description: 'Mã UUID của đề xuất' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật trạng thái thành công',
    type: SimulationRequestItemDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSimulationRequestStatusDto,
  ): Promise<SimulationRequestItemDto> {
    return this.simulationRequestsService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/simulation-requests/:id')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Xóa mềm một đề xuất bài toán (Admin only)',
    description: 'Đánh dấu đề xuất là đã xóa, không hiển thị trên danh sách.',
  })
  @ApiParam({ name: 'id', description: 'Mã UUID của đề xuất' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa đề xuất thành công',
  })
  async deleteRequest(@Param('id') id: string): Promise<{ success: boolean; id: string }> {
    return this.simulationRequestsService.remove(id);
  }
}
