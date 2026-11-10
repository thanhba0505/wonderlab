import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { S2SService } from '../s2s/s2s.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let s2s: {
    call: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    s2s = {
      call: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: S2SService,
          useValue: s2s,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users with count of runs and comments', async () => {
      const mockUsers = [
        {
          id: 'u1',
          username: 'admin',
          email: 'admin@wonderlab.local',
          role: Role.ADMIN,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { simulationRuns: 12, comments: 4 },
        },
      ];
      prisma.$transaction.mockResolvedValue([1, mockUsers]);

      const result = await service.findAll();
      expect(result).toEqual({
        data: mockUsers,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('should update role when user exists and call S2S', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', username: 'user1' });
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        username: 'user1',
        email: null,
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.updateRole('u1', Role.ADMIN, 'admin-id');
      expect(result.role).toBe(Role.ADMIN);
      expect(s2s.call).toHaveBeenCalledWith(
        'central-gateway',
        '/users/u1/role',
        expect.objectContaining({ method: 'PATCH' }),
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { role: Role.ADMIN },
      });
    });

    it('should prevent admin from downgrading self', async () => {
      await expect(service.updateRole('admin-1', Role.USER, 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateRole('non-existent', Role.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status and call S2S', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u2', isActive: true });
      prisma.user.update.mockResolvedValue({ id: 'u2', isActive: false });

      const result = await service.updateStatus('u2', false, 'admin-id');
      expect(result.isActive).toBe(false);
      expect(s2s.call).toHaveBeenCalledWith(
        'central-gateway',
        '/users/u2/status',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    it('should prevent admin from deactivating self', async () => {
      await expect(service.updateStatus('admin-1', false, 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update username and email and call S2S', async () => {
      const existing = {
        id: 'u1',
        username: 'old_name',
        email: 'old@wonderlab.local',
      };
      prisma.user.findUnique.mockImplementation(
        ({ where }: { where: { id?: string; username?: string; email?: string } }) => {
          if (where.id) return Promise.resolve(existing);
          return Promise.resolve(null);
        },
      );

      prisma.user.update.mockResolvedValue({
        ...existing,
        username: 'new_name',
        email: 'new@wonderlab.local',
      });

      const result = await service.updateProfile('u1', {
        username: 'new_name',
        email: 'new@wonderlab.local',
      });

      expect(result.username).toBe('new_name');
      expect(result.email).toBe('new@wonderlab.local');
      expect(s2s.call).toHaveBeenCalledWith(
        'central-gateway',
        '/users/u1/profile',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    it('should throw ConflictException if username is already taken', async () => {
      prisma.user.findUnique.mockImplementation(
        ({ where }: { where: { id?: string; username?: string } }) => {
          if (where.id) return Promise.resolve({ id: 'u1', username: 'current' });
          if (where.username === 'taken') return Promise.resolve({ id: 'u2', username: 'taken' });
          return Promise.resolve(null);
        },
      );

      await expect(service.updateProfile('u1', { username: 'taken' })).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
