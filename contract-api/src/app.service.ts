import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { StorageService } from './storage/storage.service';
import { CacheService } from './cache/cache.service';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth(): Promise<object> {
    const dbStatus =
      Number(this.connection.readyState) === 1 ? 'connected' : 'disconnected';

    // Test S3 and Redis connectivity
    let s3Status = 'unknown';
    let redisStatus = 'unknown';

    try {
      const s3Test = await this.storageService.testConnection();
      s3Status = s3Test ? 'connected' : 'failed';
    } catch {
      s3Status = 'error';
    }

    try {
      const redisTest = await this.cacheService.testConnection();
      const redisConnected = this.cacheService.isRedisConnected();
      redisStatus = redisTest && redisConnected ? 'connected' : 'failed';
    } catch {
      redisStatus = 'error';
    }

    const allServicesHealthy =
      dbStatus === 'connected' &&
      s3Status === 'connected' &&
      redisStatus === 'connected';

    return {
      status: allServicesHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'Contract Analysis API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        name: this.connection.db?.databaseName || 'unknown',
        host: this.connection.host || 'unknown',
      },
      storage: {
        status: s3Status,
        provider: 'AWS S3',
      },
      cache: {
        status: redisStatus,
        provider: 'Redis',
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
