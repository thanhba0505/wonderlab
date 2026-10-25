import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
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

  describe('Full Registration & OTP Email Verification flow', () => {
    const timestamp = Date.now();
    const testEmail = `newuser_${timestamp}@wonderlab.local`;
    const testUsername = `user_${timestamp}`;
    const testPassword = 'Password123!@#';
    let userAuthCookie: string;

    afterAll(async () => {
      await prisma.otpToken.deleteMany({ where: { email: { contains: 'wonderlab.local' } } });
      await prisma.user.deleteMany({ where: { username: { startsWith: 'user_' } } });
      await prisma.user.deleteMany({ where: { email: { contains: 'puregoogle' } } });
    });

    it('should register a new user and generate a 6-digit OTP', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: testUsername,
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      expect(response.body.requireOtp).toBe(true);
      expect(response.body.email).toBe(testEmail);

      // Verify OTP was saved in DB
      const otp = await prisma.otpToken.findFirst({
        where: { email: testEmail },
        orderBy: { createdAt: 'desc' },
      });
      expect(otp).toBeDefined();
      expect(otp?.code).toHaveLength(6);
    });

    it('should prevent login before OTP verification', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: testUsername,
          password: testPassword,
        })
        .expect(401);

      expect(response.body.message).toContain('chưa được xác thực');
    });

    it('should verify OTP, activate account, and issue session cookie', async () => {
      const otp = await prisma.otpToken.findFirst({
        where: { email: testEmail },
        orderBy: { createdAt: 'desc' },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: testEmail,
          code: otp!.code,
        })
        .expect(200);

      expect(response.body.user.isEmailVerified).toBe(true);
      expect(response.body.user.username).toBe(testUsername);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      userAuthCookie = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(userAuthCookie).toContain('access_token=');
    });

    it('should allow user to change password when authenticated', async () => {
      const newPassword = 'NewSecretPassword456!';
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Cookie', userAuthCookie)
        .send({
          currentPassword: testPassword,
          newPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // User should be able to login with new password
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: testUsername,
          password: newPassword,
        })
        .expect(200);
    });

    it('should allow registering with non-standard email format and short password in non-production', async () => {
      const devTimestamp = Date.now();
      const devUser = `dev_${devTimestamp}`;
      const devEmail = `arbitrary_email_${devTimestamp}`;
      const devPass = '123';

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: devUser,
          email: devEmail,
          password: devPass,
        })
        .expect(201);

      expect(response.body.requireOtp).toBe(true);
      expect(response.body.devOtpCode).toBeDefined();

      // Verify OTP with dev bypass code '123456'
      const verifyRes = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: devEmail,
          code: '123456',
        })
        .expect(200);

      expect(verifyRes.body.user.username).toBe(devUser);

      // Clean up
      await prisma.otpToken.deleteMany({ where: { email: devEmail } });
      await prisma.user.deleteMany({ where: { username: devUser } });
    });
  });

  describe('Google OAuth & Automatic Account Linking', () => {
    const timestamp = Date.now();
    const existingEmail = `linkuser_${timestamp}@wonderlab.local`;
    const existingUsername = `linkuser_${timestamp}`;
    const googleOnlyEmail = `puregoogle_${timestamp}@wonderlab.local`;

    beforeAll(async () => {
      await prisma.user.create({
        data: {
          username: existingUsername,
          email: existingEmail,
          passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashforlinkingtest',
          isEmailVerified: true,
        },
      });
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: {
          OR: [{ email: existingEmail }, { email: googleOnlyEmail }],
        },
      });
    });

    it('should link Google account when email matches existing account', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({
          email: existingEmail,
          googleId: `google-uid-999-${timestamp}`,
          name: 'New User Google',
        })
        .expect(200);

      expect(response.body.user.email).toBe(existingEmail);
      expect(response.body.user.isGoogleLinked).toBe(true);
      expect(response.body.user.hasPassword).toBe(true); // preserved existing password
    });

    it('should create new account for new Google user without password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({
          email: googleOnlyEmail,
          googleId: `google-uid-111-${timestamp}`,
          name: 'Pure Google User',
        })
        .expect(200);

      expect(response.body.user.email).toBe(googleOnlyEmail);
      expect(response.body.user.isGoogleLinked).toBe(true);
      expect(response.body.user.hasPassword).toBe(false);

      const cookies = response.headers['set-cookie'];
      const googleCookie = Array.isArray(cookies) ? cookies.join('; ') : cookies;

      // Now set password for this Google account
      const setPassRes = await request(app.getHttpServer())
        .post('/api/v1/auth/set-password')
        .set('Cookie', googleCookie)
        .send({
          newPassword: 'GoogleUserAddedPass123!',
        })
        .expect(200);

      expect(setPassRes.body.success).toBe(true);

      // Now user can log in with username/email and this new password
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: googleOnlyEmail,
          password: 'GoogleUserAddedPass123!',
        })
        .expect(200);
    });
  });
});
