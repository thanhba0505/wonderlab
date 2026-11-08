import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';

describe('S2S Internal User Sync (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testSecret = 'test_incoming_secret_key_2026';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(createValidationPipe());
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Ensure test service connection exists
    await prisma.serviceConnection.upsert({
      where: { slug: 'test-gateway' },
      update: {
        domain: 'http://localhost:5101',
        apiPrefix: '/api/v1',
        incomingSecret: testSecret,
        isActive: true,
      },
      create: {
        slug: 'test-gateway',
        name: 'Test Gateway',
        domain: 'http://localhost:5101',
        apiPrefix: '/api/v1',
        incomingSecret: testSecret,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.serviceConnection.deleteMany({
      where: { slug: 'test-gateway' },
    });
    await prisma.user.deleteMany({
      where: { username: { in: ['e2e_sync_user'] } },
    });
    await app.close();
  });

  it('should reject request without Authorization header (401)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/internal/users/sync')
      .send({
        id: '99999999-9999-9999-9999-999999999999',
        username: 'e2e_sync_user',
        isActive: true,
      })
      .expect(401);
  });

  it('should reject request with wrong Bearer token (401)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/internal/users/sync')
      .set('Authorization', 'Bearer wrong_secret')
      .send({
        id: '99999999-9999-9999-9999-999999999999',
        username: 'e2e_sync_user',
        isActive: true,
      })
      .expect(401);
  });

  it('should create new shadow user with valid token (200)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/internal/users/sync')
      .set('Authorization', `Bearer ${testSecret}`)
      .send({
        id: '99999999-9999-9999-9999-999999999999',
        username: 'e2e_sync_user',
        email: 'e2e_sync@wonderlab.local',
        role: 'USER',
        isActive: true,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('e2e_sync_user');
    expect(res.body.user.isActive).toBe(true);

    const dbUser = await prisma.user.findUnique({
      where: { id: '99999999-9999-9999-9999-999999999999' },
    });
    expect(dbUser).toBeDefined();
    expect(dbUser?.username).toBe('e2e_sync_user');
  });

  it('should update existing shadow user status (200)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/internal/users/sync')
      .set('Authorization', `Bearer ${testSecret}`)
      .send({
        id: '99999999-9999-9999-9999-999999999999',
        username: 'e2e_sync_user',
        email: 'e2e_sync@wonderlab.local',
        role: 'USER',
        isActive: false,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.user.isActive).toBe(false);

    const dbUser = await prisma.user.findUnique({
      where: { id: '99999999-9999-9999-9999-999999999999' },
    });
    expect(dbUser?.isActive).toBe(false);
  });
});
