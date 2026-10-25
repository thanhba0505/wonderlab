import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, SimulationRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSimulationRequestDto } from './dto/create-simulation-request.dto';
import {
  QuerySimulationRequestsDto,
  SimulationRequestSortBy,
} from './dto/query-simulation-requests.dto';
import { UpdateSimulationRequestStatusDto } from './dto/update-simulation-request-status.dto';
import {
  SimulationRequestItemDto,
  PaginatedSimulationRequestsDto,
  ToggleVoteResponseDto,
} from './dto/simulation-request-response.dto';

interface RawRequestWithAuthor {
  id: string;
  title: string;
  category: string;
  description: string;
  whyInteresting: string | null;
  proposedControls: string | null;
  referenceUrl: string | null;
  status: SimulationRequestStatus;
  voteCount: number;
  userId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  adminNotes: string | null;
  targetSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    role: string;
    avatarUrl: string | null;
  } | null;
}

@Injectable()
export class SimulationRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo một đề xuất bài toán / thí nghiệm mới (hỗ trợ cả người dùng đăng nhập và khách)
   */
  async create(
    dto: CreateSimulationRequestDto,
    userId?: string,
    clientSession?: string,
  ): Promise<SimulationRequestItemDto> {
    const effectiveSession = dto.clientSession || clientSession;

    // Sử dụng transaction để tạo đề xuất và tự động upvote 1 phiếu ban đầu cho người tạo
    const result = await this.prisma.$transaction(async tx => {
      const created = await tx.simulationRequest.create({
        data: {
          title: dto.title.trim(),
          category: dto.category.trim(),
          description: dto.description.trim(),
          whyInteresting: dto.whyInteresting?.trim() || null,
          proposedControls: dto.proposedControls?.trim() || null,
          referenceUrl: dto.referenceUrl?.trim() || null,
          userId: userId || null,
          guestName: userId ? null : dto.guestName?.trim() || 'Người yêu khoa học',
          guestEmail: userId ? null : dto.guestEmail?.trim() || null,
          voteCount: 1,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Tạo vote khởi tạo cho tác giả
      if (userId) {
        await tx.simulationRequestVote.create({
          data: {
            requestId: created.id,
            userId,
          },
        });
      } else if (effectiveSession) {
        await tx.simulationRequestVote.create({
          data: {
            requestId: created.id,
            clientSession: effectiveSession,
          },
        });
      }

      return created;
    });

    return this.mapToDto(result, true);
  }

  /**
   * Lấy danh sách đề xuất công khai (phân trang, lọc, sắp xếp)
   */
  async findAll(
    query: QuerySimulationRequestsDto,
    currentUserId?: string,
    clientSession?: string,
  ): Promise<PaginatedSimulationRequestsDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SimulationRequestWhereInput = {
      isDeleted: false,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.category && query.category !== 'all') {
      where.category = query.category;
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.SimulationRequestOrderByWithRelationInput = { voteCount: 'desc' };
    if (query.sortBy === SimulationRequestSortBy.NEWEST) {
      orderBy = { createdAt: 'desc' };
    } else if (query.sortBy === SimulationRequestSortBy.OLDEST) {
      orderBy = { createdAt: 'asc' };
    }

    const [total, records] = await Promise.all([
      this.prisma.simulationRequest.count({ where }),
      this.prisma.simulationRequest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    // Lấy tập hợp các requestId mà người dùng hiện tại đã bình chọn
    const effectiveSession = query.clientSession || clientSession;
    const votedRequestIds = await this.getVotedRequestIds(
      records.map(r => r.id),
      currentUserId,
      effectiveSession,
    );

    const data = records.map(record => this.mapToDto(record, votedRequestIds.has(record.id)));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Lấy chi tiết một đề xuất theo ID
   */
  async findById(
    id: string,
    currentUserId?: string,
    clientSession?: string,
  ): Promise<SimulationRequestItemDto> {
    const record = await this.prisma.simulationRequest.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Không tìm thấy đề xuất thí nghiệm với mã: ${id}`);
    }

    const votedIds = await this.getVotedRequestIds([id], currentUserId, clientSession);
    return this.mapToDto(record, votedIds.has(id));
  }

  /**
   * Toggle bình chọn (Upvote / Unvote)
   */
  async toggleVote(
    id: string,
    userId?: string,
    clientSession?: string,
  ): Promise<ToggleVoteResponseDto> {
    if (!userId && !clientSession) {
      throw new BadRequestException('Yêu cầu đăng nhập hoặc phiên trình duyệt hợp lệ để bình chọn');
    }

    // Kiểm tra đề xuất có tồn tại và không bị xóa
    const target = await this.prisma.simulationRequest.findFirst({
      where: { id, isDeleted: false },
    });
    if (!target) {
      throw new NotFoundException(`Không tìm thấy đề xuất thí nghiệm với mã: ${id}`);
    }

    return this.prisma.$transaction(async tx => {
      let existingVote = null;
      if (userId) {
        existingVote = await tx.simulationRequestVote.findUnique({
          where: {
            requestId_userId: {
              requestId: id,
              userId,
            },
          },
        });
      } else if (clientSession) {
        existingVote = await tx.simulationRequestVote.findUnique({
          where: {
            requestId_clientSession: {
              requestId: id,
              clientSession,
            },
          },
        });
      }

      if (existingVote) {
        // Đã vote -> Hủy vote (Unvote)
        await tx.simulationRequestVote.delete({
          where: { id: existingVote.id },
        });

        const updated = await tx.simulationRequest.update({
          where: { id },
          data: {
            voteCount: {
              decrement: 1,
            },
          },
          select: { voteCount: true },
        });

        return {
          success: true,
          voted: false,
          voteCount: Math.max(0, updated.voteCount),
        };
      }

      // Chưa vote -> Thêm vote (Upvote)
      await tx.simulationRequestVote.create({
        data: {
          requestId: id,
          userId: userId || null,
          clientSession: userId ? null : clientSession || null,
        },
      });

      const updated = await tx.simulationRequest.update({
        where: { id },
        data: {
          voteCount: {
            increment: 1,
          },
        },
        select: { voteCount: true },
      });

      return {
        success: true,
        voted: true,
        voteCount: updated.voteCount,
      };
    });
  }

  /**
   * Danh sách đề xuất dành riêng cho Admin (kèm email người gửi, xem cả đề xuất bị ẩn)
   */
  async findAllForAdmin(
    query: QuerySimulationRequestsDto,
  ): Promise<PaginatedSimulationRequestsDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SimulationRequestWhereInput = {
      isDeleted: false,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.category && query.category !== 'all') {
      where.category = query.category;
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { guestName: { contains: q, mode: 'insensitive' } },
        { guestEmail: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      this.prisma.simulationRequest.count({ where }),
      this.prisma.simulationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    const data = records.map(record => this.mapToDto(record, false));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Cập nhật trạng thái và ghi chú ban biên tập (Admin only)
   */
  async updateStatus(
    id: string,
    dto: UpdateSimulationRequestStatusDto,
  ): Promise<SimulationRequestItemDto> {
    const existing = await this.prisma.simulationRequest.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy đề xuất thí nghiệm với mã: ${id}`);
    }

    const dataToUpdate: Prisma.SimulationRequestUpdateInput = {};
    if (dto.status !== undefined) {
      dataToUpdate.status = dto.status;
    }
    if (dto.adminNotes !== undefined) {
      dataToUpdate.adminNotes = dto.adminNotes ? dto.adminNotes.trim() : null;
    }
    if (dto.targetSlug !== undefined) {
      dataToUpdate.targetSlug = dto.targetSlug ? dto.targetSlug.trim() : null;
    }

    const updated = await this.prisma.simulationRequest.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.mapToDto(updated, false);
  }

  /**
   * Xóa mềm đề xuất (Admin only)
   */
  async remove(id: string): Promise<{ success: boolean; id: string }> {
    const existing = await this.prisma.simulationRequest.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy đề xuất thí nghiệm với mã: ${id}`);
    }

    await this.prisma.simulationRequest.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { success: true, id };
  }

  /**
   * Helper kiểm tra danh sách bài toán đã được vote
   */
  private async getVotedRequestIds(
    requestIds: string[],
    userId?: string,
    clientSession?: string,
  ): Promise<Set<string>> {
    if (requestIds.length === 0 || (!userId && !clientSession)) {
      return new Set();
    }

    const conditions: Prisma.SimulationRequestVoteWhereInput[] = [];
    if (userId) {
      conditions.push({ userId });
    }
    if (clientSession) {
      conditions.push({ clientSession });
    }

    const votes = await this.prisma.simulationRequestVote.findMany({
      where: {
        requestId: { in: requestIds },
        OR: conditions,
      },
      select: { requestId: true },
    });

    return new Set(votes.map(v => v.requestId));
  }

  /**
   * Helper chuyển đổi bản ghi DB sang DTO phản hồi
   */
  private mapToDto(record: RawRequestWithAuthor, hasVoted: boolean): SimulationRequestItemDto {
    return {
      id: record.id,
      title: record.title,
      category: record.category,
      description: record.description,
      whyInteresting: record.whyInteresting,
      proposedControls: record.proposedControls,
      referenceUrl: record.referenceUrl,
      status: record.status,
      voteCount: record.voteCount,
      hasVoted,
      author: {
        id: record.user?.id,
        name: record.user ? record.user.username : record.guestName || 'Người yêu khoa học',
        role: record.user?.role,
        avatarUrl: record.user?.avatarUrl,
      },
      adminNotes: record.adminNotes,
      targetSlug: record.targetSlug,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
