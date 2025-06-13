import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.get('aws') as {
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
      s3Bucket: string;
    };

    this.s3Client = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });

    this.bucketName = awsConfig.s3Bucket;
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    key: string,
    file: Buffer | Readable,
    contentType?: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.s3Client.send(command);

      this.logger.log(`File uploaded successfully: ${key}`);
      return `s3://${this.bucketName}/${key}`;
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}:`, error);
      throw new Error(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Download a file from S3
   */
  async downloadFile(key: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No file body received');
      }

      this.logger.log(`File downloaded successfully: ${key}`);
      return response.Body as Readable;
    } catch (error) {
      this.logger.error(`Failed to download file ${key}:`, error);
      throw new Error(
        `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate a presigned URL for file access
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.log(`Presigned URL generated for: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}:`, error);
      throw new Error(
        `Presigned URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}:`, error);
      throw new Error(
        `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFound') {
        return false;
      }
      this.logger.error(`Failed to check file existence ${key}:`, error);
      throw new Error(
        `File existence check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Test S3 connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const testKey = 'health-check-test.txt';
      const testContent = Buffer.from('Health check test');

      // Upload test file
      await this.uploadFile(testKey, testContent, 'text/plain');

      // Check if file exists
      const exists = await this.fileExists(testKey);

      // Clean up test file
      await this.deleteFile(testKey);

      return exists;
    } catch (error) {
      this.logger.error('S3 connection test failed:', error);
      return false;
    }
  }
}
