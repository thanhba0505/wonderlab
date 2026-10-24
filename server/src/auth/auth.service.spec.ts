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

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'test-uuid-123',
    username: 'admin',
    email: 'admin@wonderlab.local',
    passwordHash: '',
    role: Role.ADMIN,
    googleId: null,
    isEmailVerified: true,
    avatarUrl: null,
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

    const mockPrismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: PrismaService, useValue: mockPrismaService },
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

    it('should throw UnauthorizedException with generic message when user does not exist', async () => {
      usersService.findByIdentifierWithHash.mockResolvedValue(null);

      await expect(
        authService.validateUser({
          username: 'nonexistent',
          password: 'AnyPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
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
});
