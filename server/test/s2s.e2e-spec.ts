import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { S2SService } from '../src/s2s/s2s.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';

describe('S2S Service Connections (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let s2sService: S2SService;
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
    s2sService = app.get<S2SService>(S2SService);

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
    await app.close();
  });

  it('should resolve active service connection by slug', async () => {
    const conn = await s2sService.getConnection('test-gateway');
    expect(conn).toBeDefined();
    expect(conn?.slug).toBe('test-gateway');
    expect(conn?.isActive).toBe(true);
  });

  it('should throw NotFoundException for non-existent service connection on call', async () => {
    await expect(s2sService.call('non-existent-slug', '/endpoint')).rejects.toThrow(
      'Active service connection not found for slug: non-existent-slug',
    );
  });
});
