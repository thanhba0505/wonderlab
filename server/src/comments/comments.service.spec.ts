import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: {
    comment: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockUser = {
    id: 'user-uuid-1',
    username: 'scientist_bob',
    role: Role.USER,
  };

  const mockAdmin = {
    id: 'admin-uuid-1',
    username: 'admin',
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    prisma = {
      comment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation((actions: Promise<unknown>[]) => Promise.all(actions)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBySimulation', () => {
    it('should query only root comments (parentId: null) and include nested replies and user data', async () => {
      const mockResult = [
        {
          id: 'comment-1',
          content: 'Thí nghiệm rất trực quan!',
          simulationSlug: 'monty-hall',
          parentId: null,
          user: mockUser,
          createdAt: new Date(),
          replies: [
            {
              id: 'comment-2',
              content: 'Đúng vậy, đổi cửa xác suất 66.7%!',
              simulationSlug: 'monty-hall',
              parentId: 'comment-1',
              user: mockAdmin,
              createdAt: new Date(),
            },
          ],
        },
      ];

      prisma.comment.findMany.mockResolvedValue(mockResult);

      const result = await service.findBySimulation('monty-hall');

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: {
          simulationSlug: 'monty-hall',
          parentId: null,
          isDeleted: false,
        },
        include: {
          user: {
            select: { id: true, username: true, role: true, isDeleted: true },
          },
          replies: {
            where: {
              isDeleted: false,
            },
            include: {
              user: {
                select: { id: true, username: true, role: true, isDeleted: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('create', () => {
    it('should create a root comment successfully when parentId is omitted', async () => {
      const dto: CreateCommentDto = {
        content: 'Bình luận thử nghiệm đầu tiên',
      };

      const mockCreated = {
        id: 'new-comment-1',
        content: dto.content,
        simulationSlug: 'birthday-paradox',
        parentId: null,
        userId: mockUser.id,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.comment.create.mockResolvedValue(mockCreated);

      const result = await service.create(mockUser.id, 'birthday-paradox', dto);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          simulationSlug: 'birthday-paradox',
          userId: mockUser.id,
          parentId: null,
        },
        include: {
          user: {
            select: { id: true, username: true, role: true, isDeleted: true },
          },
        },
      });
      expect(result.id).toBe('new-comment-1');
      expect(result.replies).toEqual([]);
    });

    it('should create a level 2 reply when parentId points to a root comment', async () => {
      const dto: CreateCommentDto = {
        content: 'Phản hồi bình luận cấp 1',
        parentId: 'root-comment-1',
      };

      prisma.comment.findUnique.mockResolvedValue({
        id: 'root-comment-1',
        parentId: null, // Root comment
        simulationSlug: 'monty-hall',
      });

      const mockCreatedReply = {
        id: 'reply-1',
        content: dto.content,
        simulationSlug: 'monty-hall',
        parentId: 'root-comment-1',
        userId: mockUser.id,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.comment.create.mockResolvedValue(mockCreatedReply);

      const result = await service.create(mockUser.id, 'monty-hall', dto);

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'root-comment-1' },
      });
      expect(result.parentId).toBe('root-comment-1');
    });

    it('should throw NotFoundException if parent comment does not exist', async () => {
      const dto: CreateCommentDto = {
        content: 'Phản hồi thất bại',
        parentId: 'non-existent-id',
      };

      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.create(mockUser.id, 'monty-hall', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject nesting beyond 2 levels with BadRequestException (STRICT 2-LEVEL GUARD)', async () => {
      const dto: CreateCommentDto = {
        content: 'Cố gắng tạo cấp 3',
        parentId: 'level-2-reply-id',
      };

      // The target parent already has a parentId (meaning it is a Level 2 comment)
      prisma.comment.findUnique.mockResolvedValue({
        id: 'level-2-reply-id',
        parentId: 'root-id', // ALREADY LEVEL 2
        simulationSlug: 'monty-hall',
      });

      await expect(service.create(mockUser.id, 'monty-hall', dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(mockUser.id, 'monty-hall', dto)).rejects.toThrow(
        'Hệ thống chỉ hỗ trợ thảo luận tối đa 2 cấp',
      );
    });

    it('should throw BadRequestException if parent comment belongs to another simulation', async () => {
      const dto: CreateCommentDto = {
        content: 'Lạc chủ đề',
        parentId: 'root-comment-other',
      };

      prisma.comment.findUnique.mockResolvedValue({
        id: 'root-comment-other',
        parentId: null,
        simulationSlug: 'birthday-paradox', // different slug!
      });

      await expect(service.create(mockUser.id, 'monty-hall', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllForAdmin', () => {
    it('should query all comments including deleted ones ordered by createdAt desc', async () => {
      const mockResult = [
        {
          id: 'comment-1',
          content: 'Bình luận quản trị',
          simulationSlug: 'monty-hall',
          parentId: null,
          isDeleted: true,
          deletedAt: new Date(),
          createdAt: new Date(),
          user: mockUser,
          parent: null,
        },
      ];
      prisma.comment.findMany.mockResolvedValue(mockResult);

      const result = await service.findAllForAdmin();

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: { id: true, username: true, role: true, isDeleted: true },
          },
          parent: {
            select: {
              id: true,
              content: true,
              user: {
                select: { username: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('should allow author to delete their own comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'comment-1',
        userId: mockUser.id,
        isDeleted: false,
      });
      prisma.comment.update.mockResolvedValue({ id: 'comment-1' });
      prisma.comment.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.delete('comment-1', mockUser.id, Role.USER);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.comment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'comment-1' },
          data: expect.objectContaining({ isDeleted: true }),
        }),
      );
      expect(result.success).toBe(true);
    });

    it('should allow ADMIN to delete any user comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'comment-1',
        userId: 'some-other-user',
        isDeleted: false,
      });
      prisma.comment.update.mockResolvedValue({ id: 'comment-1' });
      prisma.comment.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.delete('comment-1', mockAdmin.id, Role.ADMIN);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.comment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'comment-1' },
          data: expect.objectContaining({ isDeleted: true }),
        }),
      );
      expect(result.success).toBe(true);
    });

    it('should reject deletion with ForbiddenException if not author and not admin', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'comment-1',
        userId: 'original-author-id',
        isDeleted: false,
      });

      await expect(service.delete('comment-1', 'intruder-id', Role.USER)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if comment to delete does not exist', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent', mockUser.id, Role.USER)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if comment to delete is already deleted', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'comment-1',
        userId: mockUser.id,
        isDeleted: true,
      });

      await expect(service.delete('comment-1', mockUser.id, Role.USER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
