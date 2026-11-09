import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';

describe('Auth & Session Security (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authCookie: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully, issue HttpOnly access_token cookie and return user profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'admin',
          password: 'Admin@Wonderlab2026!',
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.message).toBe('Đăng nhập thành công');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('admin');
      expect(response.body.user.role).toBe('ADMIN');
      expect(response.body.user.passwordHash).toBeUndefined();

      // Verify Set-Cookie header contains HttpOnly access_token
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('access_token=');
      expect(cookieStr.toLowerCase()).toContain('httponly');

      // Store cookie for subsequent authenticated tests
      authCookie = cookieStr;
    });

    it('should reject invalid password with 401 and generic message (anti-enumeration)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'admin',
          password: 'IncorrectPassword123!',
        })
        .expect(401);

      expect(response.body.message).toBe('Tên đăng nhập hoặc mật khẩu không chính xác');
    });

    it('should reject non-existent user with 401 and identical generic message', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'nonexistent_user',
          password: 'AnyPassword123!',
        })
        .expect(401);

      expect(response.body.message).toBe('Tên đăng nhập hoặc mật khẩu không chính xác');
    });

    it('should reject invalid payload structure with 400 Bad Request and structured errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: '',
          password: '123', // less than min length 8
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.username).toBeDefined();
      expect(Array.isArray(response.body.errors.username)).toBe(true);
    });

    it('should login via devBypass on local dev without requiring real password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'admin',
          password: 'any_dev_password',
          devBypass: true,
        })
        .expect(200);

      expect(response.body.user.username).toBe('admin');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/dev/users', () => {
    it('should return list of dev users from database', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/auth/dev/users').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const admin = response.body.find((u: { username: string }) => u.username === 'admin');
      expect(admin).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('should authenticate via HttpOnly cookie and return current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.username).toBe('admin');
      expect(response.body.role).toBe('ADMIN');
      expect(response.body.passwordHash).toBeUndefined();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear access_token cookie upon logout', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Đăng xuất thành công');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      // Cookie is cleared when max-age=0 or expires in past
      expect(cookieStr).toContain('access_token=;');
    });
  });

  describe('Full Registration & Login flow via Central Gateway', () => {
    const timestamp = Date.now();
    const testEmail = `newuser_${timestamp}@wonderlab.local`;
    const testUsername = `user_${timestamp}`;
    const testPassword = 'Password123!@#';
    let userAuthCookie: string;

    afterAll(async () => {
      await prisma.user.deleteMany({ where: { username: { startsWith: 'user_' } } });
      await prisma.user.deleteMany({ where: { email: { contains: 'puregoogle' } } });
    });

    it('should register a new user via Central Gateway Master IAM', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: testUsername,
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      expect(response.body.requireOtp).toBe(false);
      expect(response.body.email).toBe(testEmail);

      // Verify user was saved locally in Wonderlab DB
      const user = await prisma.user.findFirst({
        where: { email: testEmail },
      });
      expect(user).toBeDefined();
      expect(user?.username).toBe(testUsername);
    });

    it('should allow newly registered user to log in via Central Gateway credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: testUsername,
          password: testPassword,
        })
        .expect(200);

      expect(response.body.user.username).toBe(testUsername);
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      userAuthCookie = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(userAuthCookie).toContain('access_token=');
    });
  });

  describe('Google OAuth via Central Gateway', () => {
    const timestamp = Date.now();
    const googleOnlyEmail = `puregoogle_${timestamp}@wonderlab.local`;

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: googleOnlyEmail },
      });
    });

    it('should authenticate or provision user with Google account via Central Gateway', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({
          email: googleOnlyEmail,
          googleId: `google-uid-111-${timestamp}`,
          name: 'Pure Google User',
        })
        .expect(200);

      expect(response.body.user.email).toBe(googleOnlyEmail);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const googleCookie = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(googleCookie).toContain('access_token=');
    });
  });
});
