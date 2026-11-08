import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { Response } from 'express';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { I18nService } from '../i18n/i18n.service';
import { S2SService } from '../s2s/s2s.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    serviceConnection: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  const mockUser = {
    id: 'test-uuid-123',
    username: 'admin',
    email: 'admin@wonderlab.local',
    passwordHash: '',
    role: Role.ADMIN,
    googleId: null,
    isEmailVerified: true,
    avatarUrl: null,
    isActive: true,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    // Generate valid argon2 hash for tests
    mockUser.passwordHash = await argon2.hash('Admin@Wonderlab2026!');
  });

  beforeEach(async () => {
    const mockUsersService = {
      findByIdentifierWithHash: jest.fn(),
      findByUsernameWithHash: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
    };

    const mockOtpService = {
      createAndSendOtp: jest.fn(),
      verifyOtp: jest.fn(),
    };

    prismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        create: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
      },
      serviceConnection: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const mockS2SService = {
      getConnection: jest.fn().mockResolvedValue(null),
      call: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        I18nService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: PrismaService, useValue: prismaService },
        { provide: S2SService, useValue: mockS2SService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should validate and return safe user when credentials match', async () => {
      usersService.findByIdentifierWithHash.mockResolvedValue(mockUser);

      const result = await authService.validateUser({
        username: 'admin',
        password: 'Admin@Wonderlab2026!',
      });

      expect(result).toBeDefined();
      expect(result.username).toBe('admin');
      expect('passwordHash' in result).toBe(false);
    });

    it('should throw UnauthorizedException with generic message when password does not match', async () => {
      usersService.findByIdentifierWithHash.mockResolvedValue(mockUser);

      await expect(
        authService.validateUser({
          username: 'admin',
          password: 'WrongPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with localized English message when requested', async () => {
      usersService.findByIdentifierWithHash.mockResolvedValue(null);

      await expect(
        authService.validateUser(
          {
            username: 'nonexistent',
            password: 'AnyPassword123!',
          },
          'en',
        ),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          message: 'Incorrect username or password',
        }),
      });
    });
  });

  describe('login', () => {
    it('should set HttpOnly cookie and return safe user with success message', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const { passwordHash: _, ...safeUser } = mockUser;
      const result = await authService.login(safeUser, mockResponse);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: safeUser.id,
        username: safeUser.username,
        role: safeUser.role,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock.jwt.token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );

      expect(result.message).toBe('Đăng nhập thành công');
      expect(result.user.username).toBe('admin');
    });
  });

  describe('logout', () => {
    it('should clear access_token cookie', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = authService.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );

      expect(result.success).toBe(true);
    });
  });

  describe('loginWithSso', () => {
    it('should exchange code with gateway and login user', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'gateway-token',
          user: {
            id: 'sso-1',
            username: 'sso_user',
            email: 'sso@example.com',
            role: 'USER',
            avatarUrl: null,
            isActive: true,
          },
        }),
      } as unknown as globalThis.Response);

      const ssoCreatedUser = {
        id: 'sso-1',
        username: 'sso_user',
        email: 'sso@example.com',
        role: Role.USER,
        avatarUrl: null,
        isEmailVerified: true,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        passwordHash: null,
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockImplementation(
        async (args: { where: { id?: string; username?: string } }) => {
          if (args.where.id === 'sso-1' || args.where.username === 'sso_user') {
            return ssoCreatedUser;
          }
          return mockUser;
        },
      );
      prismaService.user.create.mockResolvedValue(ssoCreatedUser);
      prismaService.user.update.mockResolvedValue(ssoCreatedUser);

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await authService.loginWithSso(
        { code: 'auth-code-123', code_verifier: 'verifier-456' },
        mockResponse,
        'vi',
      );

      expect(result.user.username).toBe('sso_user');
      expect(mockResponse.cookie).toHaveBeenCalled();

      global.fetch = originalFetch;
    });
  });
});
