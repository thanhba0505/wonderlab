import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User, Role, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

export type SafeUser = User;

export interface UserWithStats extends SafeUser {
  isDeleted: boolean;
  deletedAt: Date | null;
  _count: {
    simulationRuns: number;
    comments: number;
  };
}

export interface PaginatedUsersResult {
  data: UserWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lookup user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * User lookup by ID
   */
  async findById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * User lookup by username
   */
  async findByUsername(username: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Create new user record
   */
  async create(data: {
    username: string;
    email?: string;
    avatarUrl?: string;
    role?: Role;
  }): Promise<SafeUser> {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email?.toLowerCase(),
        avatarUrl: data.avatarUrl,
        role: data.role ?? Role.USER,
      },
    });
  }

  /**
   * Update user fields
   */
  async update(id: string, data: Partial<User>): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * List users with pagination, search, role filtering, and activity counts for Admin Console
   */
  async findAll(query: ListUsersQueryDto = new ListUsersQueryDto()): Promise<PaginatedUsersResult> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.role && (query.role === Role.ADMIN || query.role === Role.USER)) {
      where.role = query.role;
    }
    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          avatarUrl: true,
          isDeleted: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              simulationRuns: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: users as UserWithStats[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update user role (ADMIN <-> USER)
   */
  async updateRole(id: string, role: Role): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated as SafeUser;
  }

  /**
   * Delete user (Soft Delete, Admin only)
   */
  async delete(id: string, currentAdminId: string): Promise<{ success: boolean; message: string }> {
    if (id === currentAdminId) {
      throw new BadRequestException('Không thể tự xóa tài khoản của chính bạn.');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.isDeleted) {
      throw new NotFoundException('Người dùng không tồn tại hoặc đã được xóa trước đó.');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Người dùng đã được xóa thành công.',
    };
  }
}
