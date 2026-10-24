import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Auth & Session Security (e2e)', () => {
  let app: INestApplication;
  let authCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
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

    it('should reject invalid payload structure with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: '',
          password: '123', // less than min length 8
        })
        .expect(400);
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
});
