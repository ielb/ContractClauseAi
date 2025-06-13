import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  UpdateConsentDto,
  DataDeletionRequestDto,
} from '../auth/dto/gdpr-consent.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class GdprService {
  private readonly logger = new Logger(GdprService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Update user consent preferences
   */
  async updateConsent(
    userId: string,
    consentData: UpdateConsentDto,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = { ...consentData };

    // If GDPR consent version is being updated, record the consent date
    if (consentData.gdprConsentVersion) {
      updateData.gdprConsentDate = new Date();
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Consent updated for user ${userId}`);
    return updatedUser;
  }

  /**
   * Export all user data in GDPR-compliant format
   */
  async exportUserData(
    userId: string,
    format: 'json' | 'csv' = 'json',
  ): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select('+emailVerificationToken +passwordResetToken')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update last export date
    await this.userModel.findByIdAndUpdate(userId, {
      lastDataExport: new Date(),
    });

    const userData = {
      personalInformation: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiry: user.subscriptionExpiry,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accountStatus: {
        isVerified: user.isVerified,
        isActive: user.isActive,
        mfaEnabled: user.mfaEnabled,
      },
      gdprInformation: {
        gdprConsentDate: user.gdprConsentDate,
        gdprConsentVersion: user.gdprConsentVersion,
        marketingConsent: user.marketingConsent,
        analyticsConsent: user.analyticsConsent,
        dataProcessingConsent: user.dataProcessingConsent,
        lastDataExport: user.lastDataExport,
        deletionRequested: user.deletionRequested,
        deletionRequestDate: user.deletionRequestDate,
        scheduledDeletionDate: user.scheduledDeletionDate,
      },
      preferences: user.preferences,
      subscriptionMetadata: user.subscriptionMetadata,
      exportMetadata: {
        exportDate: new Date(),
        exportFormat: format,
        dataVersion: '1.0',
      },
    };

    if (format === 'csv') {
      return this.convertToCSV(userData);
    }

    this.logger.log(`Data exported for user ${userId} in ${format} format`);
    return userData;
  }

  /**
   * Request account deletion (GDPR Right to be Forgotten)
   */
  async requestDataDeletion(
    userId: string,
    deletionData: DataDeletionRequestDto,
  ): Promise<{ message: string; scheduledDeletionDate: Date }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.deletionRequested) {
      throw new BadRequestException(
        'Deletion already requested for this account',
      );
    }

    const deletionRequestDate = new Date();
    const scheduledDeletionDate = new Date();
    scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + 30); // 30-day grace period

    await this.userModel.findByIdAndUpdate(userId, {
      deletionRequested: true,
      deletionRequestDate,
      scheduledDeletionDate,
      isActive: false, // Deactivate account immediately
    });

    // Send confirmation email (placeholder - email method to be implemented)
    try {
      // TODO: Implement sendDataDeletionConfirmation in EmailService
      this.logger.log(
        `Data deletion confirmation email would be sent to ${user.email}${deletionData.reason ? ` with reason: ${deletionData.reason}` : ''}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to send deletion confirmation email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    this.logger.log(`Data deletion requested for user ${userId}`);
    return {
      message:
        'Data deletion request submitted successfully. Your account will be permanently deleted in 30 days.',
      scheduledDeletionDate,
    };
  }

  /**
   * Cancel data deletion request
   */
  async cancelDataDeletion(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletionRequested) {
      throw new BadRequestException(
        'No deletion request found for this account',
      );
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          deletionRequested: false,
          deletionRequestDate: undefined,
          scheduledDeletionDate: undefined,
          isActive: true, // Reactivate account
        },
        { new: true },
      )
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Data deletion cancelled for user ${userId}`);
    return updatedUser;
  }

  /**
   * Get GDPR compliance status for a user
   */
  async getGdprStatus(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user._id,
      gdprCompliance: {
        consentDate: user.gdprConsentDate,
        consentVersion: user.gdprConsentVersion,
        marketingConsent: user.marketingConsent,
        analyticsConsent: user.analyticsConsent,
        dataProcessingConsent: user.dataProcessingConsent,
      },
      dataRights: {
        lastDataExport: user.lastDataExport,
        deletionRequested: user.deletionRequested,
        deletionRequestDate: user.deletionRequestDate,
        scheduledDeletionDate: user.scheduledDeletionDate,
      },
      accountStatus: {
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
    };
  }

  /**
   * Process scheduled deletions (to be called by a cron job)
   */
  async processScheduledDeletions(): Promise<number> {
    const now = new Date();
    const usersToDelete = await this.userModel.find({
      deletionRequested: true,
      scheduledDeletionDate: { $lte: now },
    });

    let deletedCount = 0;
    for (const user of usersToDelete) {
      try {
        await this.userModel.findByIdAndDelete(user._id);
        deletedCount++;
        this.logger.log(
          `Permanently deleted user ${String(user._id)} as scheduled`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete user ${String(user._id)}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return deletedCount;
  }

  /**
   * Convert user data to CSV format
   */
  private convertToCSV(userData: any): string {
    const flattenObject = (obj: any, prefix = ''): any => {
      const flattened: any = {};
      for (const key in obj) {
        if (
          obj[key] &&
          typeof obj[key] === 'object' &&
          !Array.isArray(obj[key]) &&
          !(obj[key] instanceof Date)
        ) {
          Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}_`));
        } else {
          flattened[`${prefix}${key}`] = obj[key];
        }
      }
      return flattened;
    };

    const flattened = flattenObject(userData);
    const headers = Object.keys(flattened).join(',');
    const values = Object.values(flattened)
      .map((value) => `"${String(value)}"`)
      .join(',');

    return `${headers}\n${values}`;
  }
}
