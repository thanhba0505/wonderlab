import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { APP_VERSION } from '../common/version';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthService: HealthService;

  const mockPrisma = {
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
    expect(healthService).toBeDefined();
  });

  describe('check', () => {
    it('should return valid health status response with database connected', async () => {
      const response = await healthController.check();

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.service).toBe('wonderlab-server');
      expect(response.database).toBe('connected');
      expect(response.version).toBe(APP_VERSION);
      expect(typeof response.timestamp).toBe('string');
      expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
    });

    it('should report degraded and disconnected when database ping fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB unreachable'));

      const response = await healthController.check();

      expect(response.status).toBe('degraded');
      expect(response.database).toBe('disconnected');
    });
  });
});
