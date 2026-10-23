import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return valid health status response', () => {
      const response = controller.check();

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.service).toBe('wonderlab-server');
      expect(response.version).toBe('1.0.0');
      expect(typeof response.timestamp).toBe('string');
      expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
    });
  });
});
