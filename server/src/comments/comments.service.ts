import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentItemDto } from './dto/comment-response.dto';

const USER_SELECT = {
  id: true,
  username: true,
  role: true,
  isDeleted: true,
};

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy toàn bộ bình luận trên toàn hệ sinh thái phục vụ kiểm duyệt của Quản trị viên
   */
  async findAllForAdmin(): Promise<
    Array<{
      id: string;
      content: string;
      simulationSlug: string;
      parentId: string | null;
      isDeleted: boolean;
      deletedAt: Date | null;
      createdAt: Date;
      user: { id: string; username: string; role: Role; isDeleted: boolean };
      parent: { id: string; content: string; user: { username: string } } | null;
    }>
  > {
    return this.prisma.comment.findMany({
      include: {
        user: {
          select: USER_SELECT,
        },
        parent: {
          select: {
            id: true,
            content: true,
            user: {
              select: { username: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Lấy danh sách bình luận cho một mô phỏng (cấu trúc cây tối đa 2 cấp: Root -> Replies)
   */
  async findBySimulation(simulationSlug: string): Promise<CommentItemDto[]> {
    const comments = await this.prisma.comment.findMany({
      where: {
        simulationSlug,
        parentId: null, // Chỉ lấy bình luận cấp 1 ở tầng gốc
        isDeleted: false,
      },
      include: {
        user: {
          select: USER_SELECT,
        },
        replies: {
          where: {
            isDeleted: false,
          },
          include: {
            user: {
              select: USER_SELECT,
            },
          },
          orderBy: {
            createdAt: 'asc', // Các câu trả lời sắp xếp theo trình tự thời gian
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Bình luận mới nhất hiển thị trên cùng
      },
    });

    return comments as CommentItemDto[];
  }

  /**
   * Tạo bình luận mới hoặc gửi câu trả lời (giới hạn tối đa 2 cấp)
   */
  async create(
    userId: string,
    simulationSlug: string,
    dto: CreateCommentDto,
  ): Promise<CommentItemDto> {
    // Nếu có parentId -> Đây là phản hồi (Level 2)
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment || parentComment.isDeleted) {
        throw new NotFoundException('Bình luận gốc không tồn tại hoặc đã bị xóa.');
      }

      // RÀNG BUỘC CỐT LÕI: Chặn lồng quá 2 cấp
      if (parentComment.parentId !== null) {
        throw new BadRequestException(
          'Hệ thống chỉ hỗ trợ thảo luận tối đa 2 cấp. Không thể trả lời một phản hồi con.',
        );
      }

      if (parentComment.simulationSlug !== simulationSlug) {
        throw new BadRequestException('Bình luận gốc không thuộc về thí nghiệm mô phỏng này.');
      }
    }

    const created = await this.prisma.comment.create({
      data: {
        content: dto.content.trim(),
        simulationSlug,
        userId,
        parentId: dto.parentId ?? null,
      },
      include: {
        user: {
          select: USER_SELECT,
        },
      },
    });

    return {
      ...created,
      replies: [],
    } as CommentItemDto;
  }

  /**
   * Xóa bình luận (chỉ tác giả hoặc ADMIN mới có quyền)
   */
  async delete(
    commentId: string,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<{ success: boolean; message: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Bình luận không tồn tại hoặc đã được xóa trước đó.');
    }

    // Quyền: Chỉ chính tác giả hoặc ADMIN mới được xóa
    if (comment.userId !== currentUserId && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận của người khác.');
    }

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.comment.update({
        where: { id: commentId },
        data: {
          isDeleted: true,
          deletedAt: now,
        },
      }),
      this.prisma.comment.updateMany({
        where: { parentId: commentId },
        data: {
          isDeleted: true,
          deletedAt: now,
        },
      }),
    ]);

    return {
      success: true,
      message: 'Bình luận đã được xóa thành công.',
    };
  }
}
