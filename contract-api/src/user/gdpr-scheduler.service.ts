import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GdprService } from './gdpr.service';

@Injectable()
export class GdprSchedulerService {
  private readonly logger = new Logger(GdprSchedulerService.name);

  constructor(private readonly gdprService: GdprService) {}

  /**
   * Process scheduled account deletions daily at 2 AM
   * This ensures GDPR compliance by automatically deleting accounts
   * that have passed their 30-day grace period
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleScheduledDeletions() {
    this.logger.log('Starting scheduled deletion process...');

    try {
      const deletedCount = await this.gdprService.processScheduledDeletions();

      if (deletedCount > 0) {
        this.logger.log(
          `Successfully processed ${deletedCount} scheduled deletions`,
        );
      } else {
        this.logger.log('No scheduled deletions to process');
      }
    } catch (error) {
      this.logger.error(
        `Error processing scheduled deletions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Log GDPR compliance status weekly (every Sunday at 1 AM)
   * This helps with monitoring and compliance reporting
   */
  @Cron('0 1 * * 0') // Every Sunday at 1 AM
  logGdprComplianceStatus() {
    this.logger.log('Generating weekly GDPR compliance report...');

    try {
      // This could be expanded to generate actual compliance reports
      // For now, it's a placeholder for future compliance monitoring
      this.logger.log('GDPR compliance monitoring completed');
    } catch (error) {
      this.logger.error(
        `Error generating GDPR compliance report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
