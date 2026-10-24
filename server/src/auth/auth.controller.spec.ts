import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockSafeUser = {
    id: 'test-uuid-123',
    username: 'admin',
    email: 'admin@wonderlab.local',
    role: Role.ADMIN,
    googleId: null,
    isEmailVerified: true,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDetailedUser = {
    ...mockSafeUser,
    hasPassword: true,
    isGoogleLinked: false,
  };

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn().mockResolvedValue(mockSafeUser),
      login: jest.fn().mockResolvedValue({
        message: 'Đăng nhập thành công',
        user: mockDetailedUser,
      }),
      logout: jest.fn().mockReturnValue({
        success: true,
        message: 'Đăng xuất thành công',
      }),
      getDetailedProfile: jest.fn().mockResolvedValue(mockDetailedUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('should authenticate user and delegate to authService.login', async () => {
      const mockResponse = {} as Response;
      const result = await controller.login(
        { username: 'admin', password: 'Admin@Wonderlab2026!' },
        mockResponse,
      );

      expect(authService.validateUser).toHaveBeenCalledWith({
        username: 'admin',
        password: 'Admin@Wonderlab2026!',
      });
      expect(authService.login).toHaveBeenCalledWith(mockSafeUser, mockResponse);
      expect(result.user.username).toBe('admin');
    });
  });

  describe('logout', () => {
    it('should delegate to authService.logout', () => {
      const mockResponse = {} as Response;
      const result = controller.logout(mockResponse);

      expect(authService.logout).toHaveBeenCalledWith(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('getMe', () => {
    it('should return the current user profile', async () => {
      const result = await controller.getMe(mockSafeUser);
      expect(result.id).toBe(mockSafeUser.id);
      expect(result.username).toBe('admin');
    });
  });
});
