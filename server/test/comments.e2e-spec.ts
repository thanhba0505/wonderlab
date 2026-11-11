import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { S2SService } from '../src/s2s/s2s.service';

describe('Comments API (e2e)', () => {
  let app: INestApplication;
  let authCookie: string;
  let rootCommentId: string;
  let replyCommentId: string;

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

    const s2sService = app.get<S2SService>(S2SService);
    const prisma = app.get<PrismaService>(PrismaService);

    jest
      .spyOn(s2sService, 'call')
      .mockImplementation(
        async <T>(slug: string, endpoint: string, _options?: RequestInit): Promise<T> => {
          if (slug === 'central-gateway' && endpoint === '/auth/login') {
            const user = await prisma.user.findUnique({ where: { username: 'admin' } });
            if (user) {
              return {
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  role: user.role,
                  avatarUrl: user.avatarUrl,
                },
              } as T;
            }
          }
          if (slug === 'central-gateway' && endpoint.includes('/notifications')) {
            return { success: true } as T;
          }
          return {} as T;
        },
      );

    // Authenticate as seeded admin
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        username: 'admin',
        password: 'Admin@Wonderlab2026!',
        devBypass: true,
      })
      .expect(200);

    const cookies = loginRes.headers['set-cookie'];
    authCookie = Array.isArray(cookies) ? cookies.join('; ') : cookies;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/simulations/:slug/comments', () => {
    it('should be publicly accessible and return an array of comments', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/simulations/monty-hall/comments')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/v1/simulations/:slug/comments', () => {
    it('should return 401 Unauthorized if unauthenticated user attempts to comment', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/simulations/monty-hall/comments')
        .send({
          content: 'Bình luận không xác thực',
        })
        .expect(401);
    });

    it('should create a root (Level 1) comment when authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/simulations/monty-hall/comments')
        .set('Cookie', authCookie)
        .send({
          content: 'Nghịch lý Monty Hall thật sự lôi cuốn khi chạy 1000 lượt mô phỏng!',
        })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.content).toBe(
        'Nghịch lý Monty Hall thật sự lôi cuốn khi chạy 1000 lượt mô phỏng!',
      );
      expect(res.body.parentId).toBeNull();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe('admin');

      rootCommentId = res.body.id;
    });

    it('should create a reply (Level 2) comment under the root comment', async () => {
      expect(rootCommentId).toBeDefined();

      const res = await request(app.getHttpServer())
        .post('/api/v1/simulations/monty-hall/comments')
        .set('Cookie', authCookie)
        .send({
          content: 'Hoàn toàn đồng ý, xác suất đổi cửa tiệm cận 66.7% rất rõ ràng!',
          parentId: rootCommentId,
        })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.parentId).toBe(rootCommentId);

      replyCommentId = res.body.id;
    });

    it('should strictly reject nesting beyond 2 levels (Level 3) with 400 Bad Request', async () => {
      expect(replyCommentId).toBeDefined();

      const res = await request(app.getHttpServer())
        .post('/api/v1/simulations/monty-hall/comments')
        .set('Cookie', authCookie)
        .send({
          content: 'Cố gắng trả lời vào phản hồi Level 2 (Cấp 3 không được phép)',
          parentId: replyCommentId, // This parent is already Level 2!
        })
        .expect(400);

      expect(res.body.message).toContain('tối đa 2 cấp');
    });
  });

  describe('GET comments verification of 2-level structure', () => {
    it('should return the root comment with the reply nested in its replies array', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/simulations/monty-hall/comments')
        .expect(200);

      const foundRoot = res.body.find((c: { id: string }) => c.id === rootCommentId);
      expect(foundRoot).toBeDefined();
      expect(foundRoot.replies).toBeDefined();
      expect(foundRoot.replies.length).toBeGreaterThanOrEqual(1);

      const foundReply = foundRoot.replies.find((r: { id: string }) => r.id === replyCommentId);
      expect(foundReply).toBeDefined();
      expect(foundReply.parentId).toBe(rootCommentId);
    });
  });

  describe('DELETE /api/v1/comments/:id', () => {
    it('should allow admin to delete comment', async () => {
      expect(rootCommentId).toBeDefined();

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/comments/${rootCommentId}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify it's gone from simulation comments
      const checkRes = await request(app.getHttpServer())
        .get('/api/v1/simulations/monty-hall/comments')
        .expect(200);

      const found = checkRes.body.find((c: { id: string }) => c.id === rootCommentId);
      expect(found).toBeUndefined();

      // Verify it is preserved in admin comments list with isDeleted: true
      const adminRes = await request(app.getHttpServer())
        .get('/api/v1/admin/comments')
        .set('Cookie', authCookie)
        .expect(200);

      const adminComments = Array.isArray(adminRes.body) ? adminRes.body : adminRes.body.data;
      const adminFound = adminComments.find((c: { id: string }) => c.id === rootCommentId);
      expect(adminFound).toBeDefined();
      expect(adminFound.isDeleted).toBe(true);
    });
  });
});
