import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { FullHealthResponseDto, HealthResponseDto } from '../src/health/dto/health-response.dto';
import { APP_VERSION } from '../src/common/version';

describe('Server Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
        req.url = '/api/v1/health';
      } else if (req.method === 'GET' && req.url === '/health-full') {
        req.url = '/api/v1/health-full';
      }
      next();
    });
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

  const verifyLightweightHealthPayload = (body: HealthResponseDto) => {
    expect(body).toBeDefined();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('wonderlab-server');
    expect(body.version).toBe(APP_VERSION);
    expect(typeof body.timestamp).toBe('string');
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  };

  const verifyFullHealthPayload = (body: FullHealthResponseDto) => {
    expect(body).toBeDefined();
    expect(['ok', 'degraded']).toContain(body.status);
    expect(body.service).toBe('wonderlab-server');
    expect(body.database).toBe('connected');
    expect(typeof body.dbLatencyMs).toBe('number');
    expect(Array.isArray(body.services)).toBe(true);
    expect(body.version).toBe(APP_VERSION);
    expect(typeof body.timestamp).toBe('string');
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  };

  describe('GET /api/v1/health', () => {
    it('should return HTTP 200 with lightweight liveness payload', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
      verifyLightweightHealthPayload(response.body);
    });
  });

  describe('GET /health', () => {
    it('should return HTTP 200 with identical liveness payload directly on /health', async () => {
      const response = await request(app.getHttpServer()).get('/health').expect(200);
      verifyLightweightHealthPayload(response.body);
    });
  });

  describe('GET /', () => {
    it('should return HTTP 200 with identical liveness payload on root path /', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200);
      verifyLightweightHealthPayload(response.body);
    });
  });

  describe('GET /api/v1/health-full', () => {
    it('should return HTTP 200 with database connected and peer connection checks', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health-full').expect(200);
      verifyFullHealthPayload(response.body);
    });
  });

  describe('GET /health-full', () => {
    it('should return HTTP 200 with identical full health payload directly on /health-full', async () => {
      const response = await request(app.getHttpServer()).get('/health-full').expect(200);
      verifyFullHealthPayload(response.body);
    });
  });
});
