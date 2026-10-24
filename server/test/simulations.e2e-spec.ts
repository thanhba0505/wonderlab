import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Simulations API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testSessionId = `test-sess-${Date.now()}`;

  describe('POST /api/v1/simulations/runs', () => {
    it('should record a simulation run and return 201 Created', async () => {
      const payload = {
        simulationSlug: 'birthday-paradox',
        parameters: { groupSize: 23 },
        results: { collisions: 507, empiricalProbability: 0.507 },
        trialsCount: 1000,
        durationMs: 38,
        clientSession: testSessionId,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/simulations/runs')
        .send(payload)
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.run).toBeDefined();
      expect(res.body.run.simulationSlug).toBe('birthday-paradox');
      expect(res.body.run.trialsCount).toBe(1000);
      expect(res.body.cumulative).toBeDefined();
      expect(res.body.cumulative.slugRuns).toBeGreaterThanOrEqual(1);
      expect(res.body.cumulative.slugTrials).toBeGreaterThanOrEqual(1000);
    });

    it('should reject invalid payload with missing simulationSlug', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/simulations/runs')
        .send({
          parameters: { groupSize: 23 },
          results: {},
          trialsCount: 10,
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/simulations/stats', () => {
    it('should return aggregated stats with totalTrials and bySimulation records', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/simulations/stats').expect(200);

      expect(res.body).toBeDefined();
      expect(typeof res.body.totalRuns).toBe('number');
      expect(typeof res.body.totalTrials).toBe('number');
      expect(res.body.totalTrials).toBeGreaterThanOrEqual(1000);
      expect(res.body.bySimulation['birthday-paradox']).toBeDefined();
      expect(res.body.bySimulation['birthday-paradox'].runs).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/simulations/runs/history', () => {
    it('should return recent runs filtered by client session', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/simulations/runs/history?clientSession=${testSessionId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].clientSession).toBe(testSessionId);
    });
  });
});
