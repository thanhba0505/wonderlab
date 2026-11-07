import { Test, TestingModule } from '@nestjs/testing';
import { SlackNotificationService } from './slack-notification.service';

describe('SlackNotificationService', () => {
  let service: SlackNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlackNotificationService],
    }).compile();

    service = module.get<SlackNotificationService>(SlackNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should gracefully handle missing SLACK_BOT_TOKEN without throwing', async () => {
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
