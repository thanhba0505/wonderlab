import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type SafeUser = Omit<User, 'passwordHash'>;

export interface UserWithStats extends SafeUser {
  isDeleted: boolean;
  deletedAt: Date | null;
  _count: {
    simulationRuns: number;
    comments: number;
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Internal auth lookup - includes passwordHash for password verification
   */
  async findByUsernameWithHash(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Internal auth lookup by username or email
   */
  async findByIdentifierWithHash(identifier: string): Promise<User | null> {
    const isEmail = identifier.includes('@');
    if (isEmail) {
      return this.prisma.user.findUnique({
        where: { email: identifier.toLowerCase() },
      });
    }
    return this.prisma.user.findUnique({
      where: { username: identifier },
    });
  }

  /**
   * Lookup user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Lookup user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  /**
   * Safe user lookup by ID - strips passwordHash
   */
  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Safe user lookup by username - strips passwordHash
   */
  async findByUsername(username: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Create new user record
   */
  async create(data: {
    username: string;
    email?: string;
    passwordHash?: string;
    googleId?: string;
    isEmailVerified?: boolean;
    avatarUrl?: string;
    role?: Role;
  }): Promise<SafeUser> {
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email?.toLowerCase(),
        passwordHash: data.passwordHash,
        googleId: data.googleId,
        isEmailVerified: data.isEmailVerified ?? false,
        avatarUrl: data.avatarUrl,
        role: data.role ?? Role.USER,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Update user fields
   */
  async update(id: string, data: Partial<User>): Promise<SafeUser> {
    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { passwordHash: _, ...safeUser } = updated;
    return safeUser;
  }

  /**
   * List all users with activity counts for Admin Console
   */
  async findAll(): Promise<UserWithStats[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isEmailVerified: true,
        avatarUrl: true,
        googleId: true,
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
    });

    return users as UserWithStats[];
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
