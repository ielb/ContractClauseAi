import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StorageService } from '../storage/storage.service';
import { CacheService } from '../cache/cache.service';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  @Post('s3/upload')
  @ApiOperation({ summary: 'Test S3 file upload' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async testS3Upload(@Body() body: { fileName: string; content: string }) {
    try {
      const { fileName, content } = body;
      const buffer = Buffer.from(content, 'utf-8');
      const s3Url = await this.storageService.uploadFile(
        `test/${fileName}`,
        buffer,
        'text/plain',
        { purpose: 'test' },
      );

      return {
        success: true,
        message: 'File uploaded successfully',
        s3Url,
        fileName,
      };
    } catch (error) {
      throw new HttpException(
        `S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('s3/download/:fileName')
  @ApiOperation({ summary: 'Test S3 file download' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async testS3Download(@Param('fileName') fileName: string) {
    try {
      const stream = await this.storageService.downloadFile(`test/${fileName}`);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          const content = Buffer.concat(chunks).toString('utf-8');
          resolve({
            success: true,
            message: 'File downloaded successfully',
            fileName,
            content,
          });
        });
        stream.on('error', reject);
      });
    } catch (error) {
      throw new HttpException(
        `S3 download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('s3/presigned/:fileName')
  @ApiOperation({ summary: 'Test S3 presigned URL generation' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
  })
  async testS3PresignedUrl(@Param('fileName') fileName: string) {
    try {
      const presignedUrl = await this.storageService.getPresignedUrl(
        `test/${fileName}`,
        3600, // 1 hour
      );

      return {
        success: true,
        message: 'Presigned URL generated successfully',
        fileName,
        presignedUrl,
        expiresIn: 3600,
      };
    } catch (error) {
      throw new HttpException(
        `Presigned URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('redis/set')
  @ApiOperation({ summary: 'Test Redis set operation' })
  @ApiResponse({ status: 201, description: 'Value set in Redis successfully' })
  async testRedisSet(
    @Body() body: { key: string; value: string; ttl?: number },
  ) {
    try {
      const { key, value, ttl } = body;
      await this.cacheService.set(`test:${key}`, value, ttl);

      return {
        success: true,
        message: 'Value set in Redis successfully',
        key: `test:${key}`,
        value,
        ttl: ttl || 'no expiration',
      };
    } catch (error) {
      throw new HttpException(
        `Redis set failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('redis/get/:key')
  @ApiOperation({ summary: 'Test Redis get operation' })
  @ApiResponse({
    status: 200,
    description: 'Value retrieved from Redis successfully',
  })
  async testRedisGet(@Param('key') key: string) {
    try {
      const value = await this.cacheService.get(`test:${key}`);

      return {
        success: true,
        message: value
          ? 'Value retrieved from Redis successfully'
          : 'Key not found in Redis',
        key: `test:${key}`,
        value,
        found: !!value,
      };
    } catch (error) {
      throw new HttpException(
        `Redis get failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('redis/set-object')
  @ApiOperation({ summary: 'Test Redis object set operation' })
  @ApiResponse({ status: 201, description: 'Object set in Redis successfully' })
  async testRedisSetObject(
    @Body() body: { key: string; object: object; ttl?: number },
  ) {
    try {
      const { key, object, ttl } = body;
      await this.cacheService.setObject(`test:obj:${key}`, object, ttl);

      return {
        success: true,
        message: 'Object set in Redis successfully',
        key: `test:obj:${key}`,
        object,
        ttl: ttl || 'no expiration',
      };
    } catch (error) {
      throw new HttpException(
        `Redis object set failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('redis/get-object/:key')
  @ApiOperation({ summary: 'Test Redis object get operation' })
  @ApiResponse({
    status: 200,
    description: 'Object retrieved from Redis successfully',
  })
  async testRedisGetObject(@Param('key') key: string) {
    try {
      const object = await this.cacheService.getObject(`test:obj:${key}`);

      return {
        success: true,
        message: object
          ? 'Object retrieved from Redis successfully'
          : 'Key not found in Redis',
        key: `test:obj:${key}`,
        object,
        found: !!object,
      };
    } catch (error) {
      throw new HttpException(
        `Redis object get failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('connectivity')
  @ApiOperation({ summary: 'Test S3 and Redis connectivity' })
  @ApiResponse({ status: 200, description: 'Connectivity test results' })
  async testConnectivity() {
    const s3Test = await this.storageService.testConnection();
    const redisTest = await this.cacheService.testConnection();
    const redisConnected = this.cacheService.isRedisConnected();

    return {
      s3: {
        connected: s3Test,
        status: s3Test ? 'Connected' : 'Failed',
      },
      redis: {
        connected: redisTest && redisConnected,
        status: redisTest && redisConnected ? 'Connected' : 'Failed',
        clientConnected: redisConnected,
        testPassed: redisTest,
      },
      overall: {
        status:
          s3Test && redisTest && redisConnected
            ? 'All services connected'
            : 'Some services failed',
        ready: s3Test && redisTest && redisConnected,
      },
    };
  }
}
