import { Injectable, NotFoundException } from '@nestjs/common';
import { User, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type SafeUser = Omit<User, 'passwordHash'>;

export interface UserWithStats extends SafeUser {
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
    passwordHash: string;
    role?: Role;
  }): Promise<SafeUser> {
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? Role.USER,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
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
}
