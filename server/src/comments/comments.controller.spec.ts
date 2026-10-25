import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SafeUser } from '../users/users.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: {
    findBySimulation: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    findAllForAdmin: jest.Mock;
  };

  const mockUser: SafeUser = {
    id: 'user-uuid-1',
    username: 'scientist_bob',
    email: 'bob@example.com',
    role: Role.USER,
    googleId: null,
    isEmailVerified: true,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    service = {
      findBySimulation: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findAllForAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getComments', () => {
    it('should delegate to service.findBySimulation', async () => {
      const mockList = [
        {
          id: 'c1',
          content: 'Test content',
          simulationSlug: 'monty-hall',
          parentId: null,
          user: { id: mockUser.id, username: mockUser.username, role: mockUser.role },
          createdAt: new Date(),
          replies: [],
        },
      ];
      service.findBySimulation.mockResolvedValue(mockList);

      const result = await controller.getComments('monty-hall');

      expect(service.findBySimulation).toHaveBeenCalledWith('monty-hall');
      expect(result).toBe(mockList);
    });
  });

  describe('createComment', () => {
    it('should delegate to service.create with current user id', async () => {
      const dto: CreateCommentDto = { content: 'Bình luận mới' };
      const mockCreated = {
        id: 'c2',
        content: dto.content,
        simulationSlug: 'monty-hall',
        parentId: null,
        user: { id: mockUser.id, username: mockUser.username, role: mockUser.role },
        createdAt: new Date(),
        replies: [],
      };
      service.create.mockResolvedValue(mockCreated);

      const result = await controller.createComment('monty-hall', dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(mockUser.id, 'monty-hall', dto);
      expect(result).toBe(mockCreated);
    });
  });

  describe('deleteComment', () => {
    it('should delegate to service.delete with user id and role', async () => {
      service.delete.mockResolvedValue({ success: true, message: 'Đã xóa' });

      const result = await controller.deleteComment('c1', mockUser);

      expect(service.delete).toHaveBeenCalledWith('c1', mockUser.id, mockUser.role);
      expect(result.success).toBe(true);
    });
  });

  describe('getAllCommentsForAdmin', () => {
    it('should delegate to service.findAllForAdmin', async () => {
      const mockAdminComments = [
        {
          id: 'c1',
          content: 'Test content',
          simulationSlug: 'monty-hall',
          parentId: null,
          isDeleted: false,
          deletedAt: null,
          user: { id: 'u1', username: 'bob', role: Role.USER },
          createdAt: new Date(),
          parent: null,
        },
      ];
      service.findAllForAdmin.mockResolvedValue(mockAdminComments);

      const result = await controller.getAllCommentsForAdmin();

      expect(service.findAllForAdmin).toHaveBeenCalled();
      expect(result).toBe(mockAdminComments);
    });
  });
});
