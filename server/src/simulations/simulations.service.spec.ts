import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SimulationsService } from './simulations.service';
import { CreateSimulationRunDto } from './dto/create-simulation-run.dto';

describe('SimulationsService', () => {
  let service: SimulationsService;
  let prisma: {
    simulationRun: {
      create: jest.Mock;
      count: jest.Mock;
      aggregate: jest.Mock;
      groupBy: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      simulationRun: {
        create: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SimulationsService>(SimulationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordRun', () => {
    it('should create a simulation run and calculate cumulative aggregates', async () => {
      const dto: CreateSimulationRunDto = {
        simulationSlug: 'birthday-paradox',
        parameters: { groupSize: 23 },
        results: { collisions: 507, empiricalProbability: 0.507 },
        trialsCount: 1000,
        durationMs: 45,
        clientSession: 'sess_123',
      };

      const mockCreated = {
        id: 'run-uuid-1',
        simulationSlug: 'birthday-paradox',
        parameters: dto.parameters,
        results: dto.results,
        trialsCount: 1000,
        durationMs: 45,
        clientSession: 'sess_123',
        userId: null,
        createdAt: new Date('2026-10-24T12:00:00Z'),
      };

      prisma.simulationRun.create.mockResolvedValue(mockCreated);
      prisma.simulationRun.aggregate
        .mockResolvedValueOnce({
          _count: { id: 5 },
          _sum: { trialsCount: 15000 },
        })
        .mockResolvedValueOnce({
          _sum: { trialsCount: 42000 },
        });

      const result = await service.recordRun(dto);

      expect(prisma.simulationRun.create).toHaveBeenCalledWith({
        data: {
          simulationSlug: 'birthday-paradox',
          parameters: dto.parameters,
          results: dto.results,
          trialsCount: 1000,
          durationMs: 45,
          clientSession: 'sess_123',
          userId: null,
        },
      });

      expect(result.run.id).toBe('run-uuid-1');
      expect(result.cumulative.slugRuns).toBe(5);
      expect(result.cumulative.slugTrials).toBe(15000);
      expect(result.cumulative.globalTrials).toBe(42000);
    });
  });

  describe('getGlobalStats', () => {
    it('should aggregate global telemetry across all simulations', async () => {
      prisma.simulationRun.count.mockResolvedValue(42);
      prisma.simulationRun.aggregate.mockResolvedValue({
        _sum: { trialsCount: 500000 },
      });
      prisma.simulationRun.groupBy.mockResolvedValue([
        {
          simulationSlug: 'birthday-paradox',
          _count: { id: 25 },
          _sum: { trialsCount: 300000 },
          _max: { createdAt: new Date('2026-10-24T12:30:00Z') },
        },
        {
          simulationSlug: 'monty-hall',
          _count: { id: 17 },
          _sum: { trialsCount: 200000 },
          _max: { createdAt: new Date('2026-10-24T12:15:00Z') },
        },
      ]);

      const stats = await service.getGlobalStats();

      expect(stats.totalRuns).toBe(42);
      expect(stats.totalTrials).toBe(500000);
      expect(stats.bySimulation['birthday-paradox'].runs).toBe(25);
      expect(stats.bySimulation['birthday-paradox'].trials).toBe(300000);
      expect(stats.bySimulation['monty-hall'].runs).toBe(17);
      expect(stats.updatedAt).toBeDefined();
    });

    it('should pass simulationSlug filter to count and aggregate queries when provided', async () => {
      prisma.simulationRun.count.mockResolvedValue(10);
      prisma.simulationRun.aggregate.mockResolvedValue({
        _sum: { trialsCount: 10000 },
      });
      prisma.simulationRun.groupBy.mockResolvedValue([
        {
          simulationSlug: 'monty-hall',
          _count: { id: 10 },
          _sum: { trialsCount: 10000 },
          _max: { createdAt: new Date('2026-10-24T12:00:00Z') },
        },
      ]);

      const stats = await service.getGlobalStats('monty-hall');

      expect(prisma.simulationRun.count).toHaveBeenCalledWith({
        where: { simulationSlug: 'monty-hall' },
      });
      expect(stats.totalRuns).toBe(10);
      expect(stats.bySimulation['monty-hall'].trials).toBe(10000);
    });
  });

  describe('getRecentHistory', () => {
    it('should query simulation runs by clientSession', async () => {
      const mockRuns = [
        {
          id: 'run-1',
          simulationSlug: 'birthday-paradox',
          parameters: { groupSize: 23 },
          results: { collisions: 50 },
          trialsCount: 100,
          durationMs: 12,
          clientSession: 'sess_abc',
          createdAt: new Date('2026-10-24T11:00:00Z'),
        },
      ];

      prisma.simulationRun.findMany.mockResolvedValue(mockRuns);

      const history = await service.getRecentHistory({
        clientSession: 'sess_abc',
        simulationSlug: 'birthday-paradox',
        limit: 10,
      });

      expect(prisma.simulationRun.findMany).toHaveBeenCalledWith({
        where: {
          clientSession: 'sess_abc',
          simulationSlug: 'birthday-paradox',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          simulationSlug: true,
          parameters: true,
          results: true,
          trialsCount: true,
          durationMs: true,
          clientSession: true,
          createdAt: true,
        },
      });

      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('run-1');
    });
  });
});
