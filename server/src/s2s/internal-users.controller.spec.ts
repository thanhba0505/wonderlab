import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { InternalUsersController } from './internal-users.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('InternalUsersController', () => {
  let controller: InternalUsersController;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalUsersController],
      providers: [{ provide: PrismaService, useValue: prismaService }],
    }).compile();

    controller = module.get<InternalUsersController>(InternalUsersController);
  });

  it('should create new shadow user if not existing', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);
    prismaService.user.create.mockResolvedValue({
      id: 'gw-user-1',
      username: 'alice',
      email: 'alice@example.com',
      avatarUrl: 'https://example.com/alice.png',
      role: Role.USER,
      isActive: true,
    });

    const result = await controller.syncUser({
      id: 'gw-user-1',
      username: 'alice',
      email: 'alice@example.com',
      avatarUrl: 'https://example.com/alice.png',
      role: 'USER',
      isActive: true,
    });

    expect(result.success).toBe(true);
    expect(result.user.id).toBe('gw-user-1');
    expect(result.user.username).toBe('alice');
    expect(prismaService.user.create).toHaveBeenCalled();
  });

  it('should update existing shadow user if found by ID', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 'gw-user-1',
      username: 'alice_old',
    });
    prismaService.user.update.mockResolvedValue({
      id: 'gw-user-1',
      username: 'alice_new',
      email: 'alice@example.com',
      avatarUrl: null,
      role: Role.USER,
      isActive: false,
    });

    const result = await controller.syncUser({
      id: 'gw-user-1',
      username: 'alice_new',
      email: 'alice@example.com',
      avatarUrl: null,
      role: 'USER',
      isActive: false,
    });

    expect(result.success).toBe(true);
    expect(result.user.username).toBe('alice_new');
    expect(result.user.isActive).toBe(false);
    expect(prismaService.user.update).toHaveBeenCalled();
  });
});
