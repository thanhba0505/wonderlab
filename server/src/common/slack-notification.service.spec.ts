import { Test, TestingModule } from '@nestjs/testing';
import { SlackNotificationService } from './slack-notification.service';

describe('SlackNotificationService', () => {
  let service: SlackNotificationService;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue('ok'),
    } as unknown as Response);

    const module: TestingModule = await Test.createTestingModule({
      providers: [SlackNotificationService],
    }).compile();

    service = module.get<SlackNotificationService>(SlackNotificationService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should gracefully handle missing GATEWAY_SECRET_KEY without throwing', async () => {
    await expect(
      service.notifySimulationRequest({
        title: 'Quantum Teleportation',
        description: 'Test description',
        category: 'Physics',
        authorName: 'Tester',
      }),
    ).resolves.toBeUndefined();

    await expect(
      service.notifyNewComment({
        simulationSlug: 'monty-hall',
        authorName: 'Learner',
        content: 'Fascinating probability paradox!',
      }),
    ).resolves.toBeUndefined();
  });
});
