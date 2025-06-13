import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GdprService } from './gdpr.service';
import { User } from '../schemas/user.schema';
import { EmailService } from '../email/email.service';

describe('GdprService', () => {
  let service: GdprService;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    isVerified: true,
    isActive: true,
    gdprConsentDate: new Date(),
    gdprConsentVersion: '1.0',
    marketingConsent: false,
    analyticsConsent: false,
    dataProcessingConsent: true,
    deletionRequested: false,
    mfaEnabled: false,
    subscriptionPlan: 'free',
    preferences: {},
    subscriptionMetadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockEmailService = {
    sendDataDeletionConfirmation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GdprService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<GdprService>(GdprService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateConsent', () => {
    it('should update user consent preferences', async () => {
      const userId = 'user123';
      const consentData = {
        marketingConsent: true,
        analyticsConsent: true,
        gdprConsentVersion: '2.0',
      };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndUpdate.mockResolvedValue({
        ...mockUser,
        ...consentData,
        gdprConsentDate: expect.any(Date),
      });

      const result = await service.updateConsent(userId, consentData);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          ...consentData,
          gdprConsentDate: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        service.updateConsent('nonexistent', { marketingConsent: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportUserData', () => {
    it('should export user data in JSON format', async () => {
      const userId = 'user123';
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await service.exportUserData(userId, 'json');

      expect(result).toHaveProperty('personalInformation');
      expect(result).toHaveProperty('accountStatus');
      expect(result).toHaveProperty('gdprInformation');
      expect(result).toHaveProperty('exportMetadata');
      expect(result.exportMetadata.exportFormat).toBe('json');
    });

    it('should export user data in CSV format', async () => {
      const userId = 'user123';
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await service.exportUserData(userId, 'csv');

      expect(typeof result).toBe('string');
      expect(result).toContain(','); // CSV format
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.exportUserData('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('requestDataDeletion', () => {
    it('should request data deletion successfully', async () => {
      const userId = 'user123';
      const deletionData = { reason: 'No longer need the service' };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await service.requestDataDeletion(userId, deletionData);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('scheduledDeletionDate');
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          deletionRequested: true,
          isActive: false,
        }),
      );
    });

    it('should throw BadRequestException if deletion already requested', async () => {
      const userId = 'user123';
      const userWithDeletionRequest = { ...mockUser, deletionRequested: true };

      mockUserModel.findById.mockResolvedValue(userWithDeletionRequest);

      await expect(
        service.requestDataDeletion(userId, { reason: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelDataDeletion', () => {
    it('should cancel data deletion successfully', async () => {
      const userId = 'user123';
      const userWithDeletionRequest = { ...mockUser, deletionRequested: true };

      mockUserModel.findById.mockResolvedValue(userWithDeletionRequest);
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...mockUser,
            deletionRequested: false,
            isActive: true,
          }),
        }),
      });

      const result = await service.cancelDataDeletion(userId);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          deletionRequested: false,
          isActive: true,
        }),
        { new: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if no deletion request found', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      await expect(service.cancelDataDeletion('user123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getGdprStatus', () => {
    it('should return GDPR status for user', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.getGdprStatus('user123');

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('gdprCompliance');
      expect(result).toHaveProperty('dataRights');
      expect(result).toHaveProperty('accountStatus');
    });
  });

  describe('processScheduledDeletions', () => {
    it('should process scheduled deletions', async () => {
      const usersToDelete = [
        { _id: 'user1', deletionRequested: true },
        { _id: 'user2', deletionRequested: true },
      ];

      mockUserModel.find.mockResolvedValue(usersToDelete);
      mockUserModel.findByIdAndDelete.mockResolvedValue({});

      const result = await service.processScheduledDeletions();

      expect(result).toBe(2);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(2);
    });

    it('should handle deletion errors gracefully', async () => {
      const usersToDelete = [{ _id: 'user1', deletionRequested: true }];

      mockUserModel.find.mockResolvedValue(usersToDelete);
      mockUserModel.findByIdAndDelete.mockRejectedValue(
        new Error('Deletion failed'),
      );

      const result = await service.processScheduledDeletions();

      expect(result).toBe(0); // No successful deletions
    });
  });
});
