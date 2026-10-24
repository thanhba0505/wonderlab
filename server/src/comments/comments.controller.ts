import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentItemDto, DeleteCommentResponseDto } from './dto/comment-response.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SafeUser } from '../users/users.service';
import { Role } from '@prisma/client';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/comments')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Lấy toàn bộ bình luận phục vụ kiểm duyệt (Admin only)',
    description:
      'Trả về toàn bộ danh sách bình luận trên mọi thí nghiệm, kèm người gửi và thông tin phân cấp.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Toàn bộ danh sách bình luận kiểm duyệt',
  })
  async getAllCommentsForAdmin() {
    return this.commentsService.findAllForAdmin();
  }

  @Public()
  @Get('simulations/:slug/comments')
  @ApiOperation({
    summary: 'Lấy danh sách bình luận của thí nghiệm mô phỏng',
    description:
      'Trả về danh sách bình luận cấp 1 kèm các câu trả lời cấp 2 lồng bên trong. Công khai cho mọi người xem.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug định danh thí nghiệm mô phỏng',
    example: 'monty-hall',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách bình luận phân cấp',
    type: [CommentItemDto],
  })
  async getComments(@Param('slug') slug: string): Promise<CommentItemDto[]> {
    return this.commentsService.findBySimulation(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post('simulations/:slug/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Gửi bình luận hoặc câu trả lời (Yêu cầu đăng nhập, tối đa 2 cấp)',
    description:
      'Chỉ người dùng đã đăng nhập mới có quyền bình luận. Cung cấp parentId để trả lời bình luận cấp 1. Hệ thống sẽ từ chối nếu trả lời một bình luận cấp 2.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug định danh thí nghiệm mô phỏng',
    example: 'monty-hall',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bình luận được đăng thành công',
    type: CommentItemDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Nội dung không hợp lệ hoặc cố gắng lồng quá 2 cấp',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa đăng nhập tài khoản',
  })
  async createComment(
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() currentUser: SafeUser,
  ): Promise<CommentItemDto> {
    return this.commentsService.create(currentUser.id, slug, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Xóa bình luận (Tác giả hoặc Quản trị viên)',
    description: 'Chỉ tác giả của bình luận hoặc tài khoản có role ADMIN mới có quyền xóa.',
  })
  @ApiParam({ name: 'id', description: 'ID của bình luận cần xóa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa bình luận thành công',
    type: DeleteCommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xóa bình luận này',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bình luận không tồn tại',
  })
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() currentUser: SafeUser,
  ): Promise<DeleteCommentResponseDto> {
    return this.commentsService.delete(id, currentUser.id, currentUser.role);
  }
}
