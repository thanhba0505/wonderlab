import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SimulationRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SimulationRequestsService } from './simulation-requests.service';
import { CreateSimulationRequestDto } from './dto/create-simulation-request.dto';
import {
  QuerySimulationRequestsDto,
  SimulationRequestSortBy,
} from './dto/query-simulation-requests.dto';

describe('SimulationRequestsService', () => {
  let service: SimulationRequestsService;
  let prisma: {
    simulationRequest: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    simulationRequestVote: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockDate = new Date('2026-10-25T12:00:00Z');

  const mockUser = {
    id: 'user-uuid-1',
    username: 'galileo',
    role: 'USER',
    avatarUrl: null,
  };

  const mockRequestRecord = {
    id: 'req-uuid-1',
    title: 'Nghịch lý Fermi',
    category: 'Vật lý & Lượng tử',
    description: 'Nghịch lý về sự im lặng của vũ trụ và nền văn minh ngoài Trái Đất.',
    whyInteresting: 'Giúp trực quan hóa phương trình Drake với các tham số tương tác.',
    proposedControls: 'Thanh trượt số sao, xác suất sự sống.',
    referenceUrl: 'https://vi.wikipedia.org/wiki/Ngh%E1%BB%8Bch_l%C3%BD_Fermi',
    status: SimulationRequestStatus.PENDING,
    voteCount: 1,
    userId: mockUser.id,
    guestName: null,
    guestEmail: null,
    adminNotes: null,
    targetSlug: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    user: mockUser,
  };

  beforeEach(async () => {
    prisma = {
      simulationRequest: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      simulationRequestVote: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async callback => {
        if (typeof callback === 'function') {
          return callback(prisma);
        }
        return Promise.all(callback);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationRequestsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SimulationRequestsService>(SimulationRequestsService);
  });

  describe('create', () => {
    it('should create a simulation request for an authenticated user with an initial vote', async () => {
      const dto: CreateSimulationRequestDto = {
        title: 'Nghịch lý Fermi',
        category: 'Vật lý & Lượng tử',
        description: 'Nghịch lý về sự im lặng của vũ trụ và nền văn minh ngoài Trái Đất.',
        whyInteresting: 'Giúp trực quan hóa phương trình Drake.',
      };

      prisma.simulationRequest.create.mockResolvedValue(mockRequestRecord);
      prisma.simulationRequestVote.create.mockResolvedValue({ id: 'vote-1' });

      const result = await service.create(dto, mockUser.id);

      expect(prisma.simulationRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: dto.title,
            category: dto.category,
            userId: mockUser.id,
            voteCount: 1,
          }),
        }),
      );
      expect(prisma.simulationRequestVote.create).toHaveBeenCalledWith({
        data: {
          requestId: mockRequestRecord.id,
          userId: mockUser.id,
        },
      });
      expect(result.id).toBe(mockRequestRecord.id);
      expect(result.hasVoted).toBe(true);
      expect(result.author.name).toBe(mockUser.username);
    });

    it('should create a simulation request for a guest user with clientSession vote', async () => {
      const dto: CreateSimulationRequestDto = {
        title: 'Nghịch lý Cốm và Hạt Thóc',
        category: 'Toán học & Xác suất',
        description: 'Bài toán cấp số nhân lũy thừa trên bàn cờ 64 ô.',
        guestName: 'Nhà toán học trẻ',
        guestEmail: 'guest@example.com',
        clientSession: 'sess_123',
      };

      const guestRecord = {
        ...mockRequestRecord,
        id: 'req-guest-1',
        title: dto.title,
        category: dto.category,
        description: dto.description,
        userId: null,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        user: null,
      };

      prisma.simulationRequest.create.mockResolvedValue(guestRecord);
      prisma.simulationRequestVote.create.mockResolvedValue({ id: 'vote-2' });

      const result = await service.create(dto, undefined, 'sess_123');

      expect(prisma.simulationRequestVote.create).toHaveBeenCalledWith({
        data: {
          requestId: guestRecord.id,
          clientSession: 'sess_123',
        },
      });
      expect(result.author.name).toBe('Nhà toán học trẻ');
      expect(result.hasVoted).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of simulation requests and map voted state', async () => {
      const query: QuerySimulationRequestsDto = {
        page: 1,
        limit: 10,
        sortBy: SimulationRequestSortBy.VOTES,
      };

      prisma.simulationRequest.count.mockResolvedValue(1);
      prisma.simulationRequest.findMany.mockResolvedValue([mockRequestRecord]);
      prisma.simulationRequestVote.findMany.mockResolvedValue([
        { requestId: mockRequestRecord.id },
      ]);

      const result = await service.findAll(query, mockUser.id);

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.hasVoted).toBe(true);
      expect(result.data[0]?.title).toBe('Nghịch lý Fermi');
    });

    it('should apply filters for category and search', async () => {
      const query: QuerySimulationRequestsDto = {
        category: 'Toán học & Xác suất',
        search: 'Fermi',
      };

      prisma.simulationRequest.count.mockResolvedValue(0);
      prisma.simulationRequest.findMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(prisma.simulationRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            category: 'Toán học & Xác suất',
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return simulation request detail when found', async () => {
      prisma.simulationRequest.findFirst.mockResolvedValue(mockRequestRecord);
      prisma.simulationRequestVote.findMany.mockResolvedValue([]);

      const result = await service.findById(mockRequestRecord.id);

      expect(result.id).toBe(mockRequestRecord.id);
      expect(result.hasVoted).toBe(false);
    });

    it('should throw NotFoundException when simulation request is not found', async () => {
      prisma.simulationRequest.findFirst.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleVote', () => {
    it('should throw BadRequestException if neither userId nor clientSession is provided', async () => {
      await expect(service.toggleVote('req-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if target request does not exist', async () => {
      prisma.simulationRequest.findFirst.mockResolvedValue(null);

      await expect(service.toggleVote('req-nonexistent', mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should upvote when user has not voted yet (increment)', async () => {
      prisma.simulationRequest.findFirst.mockResolvedValue(mockRequestRecord);
      prisma.simulationRequestVote.findUnique.mockResolvedValue(null);
      prisma.simulationRequestVote.create.mockResolvedValue({ id: 'new-vote' });
      prisma.simulationRequest.update.mockResolvedValue({ voteCount: 2 });

      const result = await service.toggleVote(mockRequestRecord.id, mockUser.id);

      expect(result.success).toBe(true);
      expect(result.voted).toBe(true);
      expect(result.voteCount).toBe(2);
      expect(prisma.simulationRequestVote.create).toHaveBeenCalledWith({
        data: {
          requestId: mockRequestRecord.id,
          userId: mockUser.id,
          clientSession: null,
        },
      });
    });

    it('should unvote when user has already voted (decrement)', async () => {
      prisma.simulationRequest.findFirst.mockResolvedValue(mockRequestRecord);
      prisma.simulationRequestVote.findUnique.mockResolvedValue({ id: 'existing-vote-1' });
      prisma.simulationRequestVote.delete.mockResolvedValue({ id: 'existing-vote-1' });
      prisma.simulationRequest.update.mockResolvedValue({ voteCount: 0 });

      const result = await service.toggleVote(mockRequestRecord.id, mockUser.id);

      expect(result.success).toBe(true);
      expect(result.voted).toBe(false);
      expect(result.voteCount).toBe(0);
      expect(prisma.simulationRequestVote.delete).toHaveBeenCalledWith({
        where: { id: 'existing-vote-1' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update request status, admin notes, and target slug', async () => {
      prisma.simulationRequest.findFirst.mockResolvedValue(mockRequestRecord);
      const updatedRecord = {
        ...mockRequestRecord,
        status: SimulationRequestStatus.COMPLETED,
        adminNotes: 'Đã hoàn thành và triển khai mô phỏng.',
        targetSlug: 'fermi-paradox',
      };
      prisma.simulationRequest.update.mockResolvedValue(updatedRecord);

      const result = await service.updateStatus(mockRequestRecord.id, {
        status: SimulationRequestStatus.COMPLETED,
        adminNotes: 'Đã hoàn thành và triển khai mô phỏng.',
        targetSlug: 'fermi-paradox',
      });

      expect(result.status).toBe(SimulationRequestStatus.COMPLETED);
      expect(result.adminNotes).toBe('Đã hoàn thành và triển khai mô phỏng.');
      expect(result.targetSlug).toBe('fermi-paradox');
    });

    it('should throw NotFoundException if request to update does not exist', async () => {
      prisma.simulationRequest.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('unknown-id', { status: SimulationRequestStatus.PLANNED }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete request', async () => {
      prisma.simulationRequest.findFirst.mockResolvedValue(mockRequestRecord);
      prisma.simulationRequest.update.mockResolvedValue({
        ...mockRequestRecord,
        isDeleted: true,
      });

      const result = await service.remove(mockRequestRecord.id);

      expect(result.success).toBe(true);
      expect(result.id).toBe(mockRequestRecord.id);
      expect(prisma.simulationRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockRequestRecord.id },
          data: expect.objectContaining({ isDeleted: true }),
        }),
      );
    });
  });
});
