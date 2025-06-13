/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendPasswordChangeConfirmationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return user and token on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      };
      const result = {
        user: { id: '1', email: 'test@example.com' },
        token: 'jwt-token',
      };

      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValue(result);

      expect(await controller.login(loginDto)).toBe(result);
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    it('should return success message on logout', async () => {
      const req = {
        user: { id: '1', email: 'test@example.com', role: 'user' },
      };
      const result = { message: 'Logged out successfully' };

      const logoutSpy = jest
        .spyOn(authService, 'logout')
        .mockResolvedValue(result);

      expect(await controller.logout(req as any)).toBe(result);
      expect(logoutSpy).toHaveBeenCalledWith('1');
    });
  });

  describe('forgotPassword', () => {
    it('should return success message for forgot password', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };
      const result = {
        message:
          'If a user with that email exists, a password reset link has been sent.',
      };

      const forgotPasswordSpy = jest
        .spyOn(authService, 'forgotPassword')
        .mockResolvedValue(result);

      expect(await controller.forgotPassword(forgotPasswordDto)).toBe(result);
      expect(forgotPasswordSpy).toHaveBeenCalledWith(forgotPasswordDto);
    });
  });

  describe('resetPassword', () => {
    it('should return success message for password reset', async () => {
      const resetPasswordDto = {
        token: 'reset-token',
        newPassword: 'NewPassword123!',
      };
      const result = { message: 'Password has been reset successfully' };

      const resetPasswordSpy = jest
        .spyOn(authService, 'resetPassword')
        .mockResolvedValue(result);

      expect(await controller.resetPassword(resetPasswordDto)).toBe(result);
      expect(resetPasswordSpy).toHaveBeenCalledWith(resetPasswordDto);
    });
  });
});
