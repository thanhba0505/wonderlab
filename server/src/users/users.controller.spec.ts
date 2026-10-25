import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: {
    findAll: jest.Mock;
    updateRole: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      updateRole: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return list of users', async () => {
      const mockUsers = [{ id: 'u1', username: 'admin', role: Role.ADMIN }];
      service.findAll.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();
      expect(result).toBe(mockUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('updateUserRole', () => {
    it('should delegate to service.updateRole', async () => {
      const mockUser = { id: 'u1', username: 'admin', role: Role.USER };
      service.updateRole.mockResolvedValue(mockUser);

      const result = await controller.updateUserRole('u1', { role: Role.USER });
      expect(result).toBe(mockUser);
      expect(service.updateRole).toHaveBeenCalledWith('u1', Role.USER);
    });
  });

  describe('deleteUser', () => {
    it('should delegate to service.delete with user id and current admin id', async () => {
      service.delete.mockResolvedValue({ success: true, message: 'Deleted' });
      const currentAdmin = {
        id: 'admin-1',
        username: 'admin',
        email: null,
        googleId: null,
        isEmailVerified: true,
        avatarUrl: null,
        role: Role.ADMIN,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await controller.deleteUser('u2', currentAdmin);
      expect(result.success).toBe(true);
      expect(service.delete).toHaveBeenCalledWith('u2', 'admin-1');
    });
  });
});
