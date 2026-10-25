import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HealthResponseDto } from '../src/health/dto/health-response.dto';
import pkg from '../package.json';

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

  const verifyHealthPayload = (body: HealthResponseDto) => {
    expect(body).toBeDefined();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('wonderlab-server');
    expect(body.database).toBe('connected');
    expect(body.version).toBe(pkg.version);
    expect(typeof body.timestamp).toBe('string');
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  };

  describe('GET /api/v1/health', () => {
    it('should return HTTP 200 with standard health contract and connected database', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
      verifyHealthPayload(response.body);
    });
  });

  describe('GET /health', () => {
    it('should return HTTP 200 with identical health payload directly on /health', async () => {
      const response = await request(app.getHttpServer()).get('/health').expect(200);
      verifyHealthPayload(response.body);
    });
  });

  describe('GET /', () => {
    it('should return HTTP 200 with identical health payload on root path /', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200);
      verifyHealthPayload(response.body);
    });
  });
});
