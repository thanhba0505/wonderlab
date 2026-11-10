import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { User, Role, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { S2SService } from '../s2s/s2s.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

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
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s2sService: S2SService,
  ) {}

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
          isActive: true,
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
   * Update user role (ADMIN <-> USER) with S2S sync to Central Gateway Master IAM
   */
  async updateRole(id: string, role: Role, currentAdminId?: string): Promise<SafeUser> {
    if (currentAdminId && id === currentAdminId && role !== Role.ADMIN) {
      throw new BadRequestException('Không thể tự hạ cấp tài khoản quản trị viên của chính bạn.');
    }

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    // 1. Sync to Central Gateway Master IAM via S2S
    try {
      await this.s2sService.call('central-gateway', `/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    } catch (err: unknown) {
      this.logger.warn(
        `Failed S2S updateRole for user ${id} on central-gateway: ${(err as Error).message}`,
      );
    }

    // 2. Update local shadow user
    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    return updated;
  }

  /**
   * Update user active/inactive status with S2S sync to Central Gateway Master IAM
   */
  async updateStatus(id: string, isActive: boolean, currentAdminId?: string): Promise<SafeUser> {
    if (currentAdminId && id === currentAdminId && !isActive) {
      throw new BadRequestException(
        'Không thể tự vô hiệu hóa tài khoản quản trị viên của chính bạn.',
      );
    }

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    // 1. Sync to Central Gateway Master IAM via S2S
    try {
      await this.s2sService.call('central-gateway', `/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    } catch (err: unknown) {
      this.logger.warn(
        `Failed S2S updateStatus for user ${id} on central-gateway: ${(err as Error).message}`,
      );
    }

    // 2. Update local shadow user
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return updated;
  }

  /**
   * Self profile update (username and/or email only) with S2S sync to Central Gateway Master IAM
   */
  async updateProfile(userId: string, data: UpdateMyProfileDto): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    if (data.username && data.username !== existing.username) {
      const conflict = await this.prisma.user.findUnique({
        where: { username: data.username },
      });
      if (conflict) {
        throw new ConflictException('Tên người dùng đã được sử dụng.');
      }
    }

    if (data.email && data.email !== existing.email) {
      const conflict = await this.prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (conflict) {
        throw new ConflictException('Địa chỉ email đã được sử dụng.');
      }
    }

    // 1. Sync to Central Gateway Master IAM via S2S
    try {
      await this.s2sService.call('central-gateway', `/users/${userId}/profile`, {
        method: 'PATCH',
        body: JSON.stringify({
          username: data.username,
          email: data.email?.toLowerCase(),
        }),
      });
    } catch (err: unknown) {
      this.logger.warn(
        `Failed S2S updateProfile for user ${userId} on central-gateway: ${(err as Error).message}`,
      );
    }

    // 2. Update local shadow user
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.username ? { username: data.username } : {}),
        ...(data.email !== undefined
          ? { email: data.email ? data.email.toLowerCase() : null }
          : {}),
      },
    });

    return updated;
  }
}
