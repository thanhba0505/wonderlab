import { Test, TestingModule } from '@nestjs/testing';
import { SimulationsController } from './simulations.controller';
import { SimulationsService } from './simulations.service';
import { CreateSimulationRunDto } from './dto/create-simulation-run.dto';

describe('SimulationsController', () => {
  let controller: SimulationsController;
  let service: jest.Mocked<SimulationsService>;

  beforeEach(async () => {
    const mockService = {
      recordRun: jest.fn(),
      getGlobalStats: jest.fn(),
      getRecentHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulationsController],
      providers: [
        {
          provide: SimulationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SimulationsController>(SimulationsController);
    service = module.get(SimulationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('recordRun', () => {
    it('should pass dto and session header to service', async () => {
      const dto: CreateSimulationRunDto = {
        simulationSlug: 'birthday-paradox',
        parameters: { groupSize: 23 },
        results: { collisions: 507 },
        trialsCount: 1000,
      };

      const mockResult = {
        run: {
          id: 'test-run-id',
          simulationSlug: 'birthday-paradox',
          parameters: dto.parameters,
          results: dto.results,
          trialsCount: 1000,
          durationMs: null,
          clientSession: 'hdr-session-123',
          createdAt: new Date(),
        },
        cumulative: {
          slugRuns: 1,
          slugTrials: 1000,
          globalTrials: 1000,
        },
      };

      service.recordRun.mockResolvedValue(mockResult);

      const result = await controller.recordRun(dto, 'hdr-session-123');

      expect(dto.clientSession).toBe('hdr-session-123');
      expect(service.recordRun).toHaveBeenCalledWith(dto, undefined);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getStats', () => {
    it('should delegate to service.getGlobalStats', async () => {
      const mockStats = {
        totalRuns: 10,
        totalTrials: 100000,
        bySimulation: {},
        updatedAt: new Date().toISOString(),
      };

      service.getGlobalStats.mockResolvedValue(mockStats);

      const res = await controller.getStats({ simulationSlug: 'birthday-paradox' });

      expect(service.getGlobalStats).toHaveBeenCalledWith('birthday-paradox');
      expect(res).toEqual(mockStats);
    });
  });

  describe('getHistory', () => {
    it('should inject session header into query and delegate to service', async () => {
      const query = { limit: 15 };
      service.getRecentHistory.mockResolvedValue([]);

      await controller.getHistory(query, 'hdr-session-456');

      expect(query).toEqual({ limit: 15, clientSession: 'hdr-session-456' });
      expect(service.getRecentHistory).toHaveBeenCalledWith(
        { limit: 15, clientSession: 'hdr-session-456' },
        undefined,
      );
    });
  });
});
