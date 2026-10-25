import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users with count of runs and comments', async () => {
      const mockUsers = [
        {
          id: 'u1',
          username: 'admin',
          email: 'admin@wonderlab.local',
          role: Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { simulationRuns: 12, comments: 4 },
        },
      ];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('should update role when user exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', username: 'user1' });
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        username: 'user1',
        email: null,
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.updateRole('u1', Role.ADMIN);
      expect(result.role).toBe(Role.ADMIN);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { role: Role.ADMIN },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateRole('non-existent', Role.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should soft-delete user when user exists and is not self', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u2', isDeleted: false });
      prisma.user.update.mockResolvedValue({ id: 'u2', isDeleted: true });

      const result = await service.delete('u2', 'admin-id');
      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u2' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should throw BadRequestException when trying to delete self account', async () => {
      await expect(service.delete('admin-id', 'admin-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.delete('non-existent', 'admin-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is already deleted', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u2', isDeleted: true });
      await expect(service.delete('u2', 'admin-id')).rejects.toThrow(NotFoundException);
    });
  });
});
