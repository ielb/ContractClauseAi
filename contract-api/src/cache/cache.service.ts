import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: RedisClientType;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get('redis') as {
      url: string;
      password?: string;
      host: string;
      port: number;
    };

    const clientConfig: {
      url: string;
      password?: string;
      socket: {
        host: string;
        port: number;
      };
    } = {
      url: redisConfig.url,
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
    };

    // Only add password if it's provided
    if (redisConfig.password) {
      clientConfig.password = redisConfig.password;
    }

    this.redisClient = createClient(clientConfig);

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.redisClient.on('ready', () => {
      this.logger.log('Redis Client Ready');
      this.isConnected = true;
    });

    this.redisClient.on('end', () => {
      this.logger.log('Redis Client Disconnected');
      this.isConnected = false;
    });

    void this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.redisClient.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.redisClient.quit();
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }

  /**
   * Set a value in Redis with optional expiration
   */
  async set(
    key: string,
    value: string,
    expirationInSeconds?: number,
  ): Promise<void> {
    try {
      if (expirationInSeconds) {
        await this.redisClient.setEx(key, expirationInSeconds, value);
      } else {
        await this.redisClient.set(key, value);
      }
      this.logger.debug(`Cache set: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}:`, error);
      throw new Error(
        `Cache set failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a value from Redis
   */
  async get(key: string): Promise<string | null> {
    try {
      const value = await this.redisClient.get(key);
      this.logger.debug(`Cache get: ${key} - ${value ? 'hit' : 'miss'}`);
      return value;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}:`, error);
      throw new Error(
        `Cache get failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Set a JSON object in Redis
   */
  async setObject(
    key: string,
    value: object,
    expirationInSeconds?: number,
  ): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.set(key, jsonValue, expirationInSeconds);
  }

  /**
   * Get a JSON object from Redis
   */
  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key from Redis
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.del(key);
      this.logger.debug(
        `Cache delete: ${key} - ${result > 0 ? 'success' : 'not found'}`,
      );
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}:`, error);
      throw new Error(
        `Cache delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Check if a key exists in Redis
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Failed to check existence of cache key ${key}:`,
        error,
      );
      throw new Error(
        `Cache exists check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redisClient.expire(key, seconds);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to set expiration for cache key ${key}:`,
        error,
      );
      throw new Error(
        `Cache expire failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get multiple keys at once
   */
  async getMultiple(keys: string[]): Promise<(string | null)[]> {
    try {
      const values = await this.redisClient.mGet(keys);
      this.logger.debug(`Cache multi-get: ${keys.length} keys`);
      return values;
    } catch (error) {
      this.logger.error(`Failed to get multiple cache keys:`, error);
      throw new Error(
        `Cache multi-get failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Clear all keys (use with caution)
   */
  async clear(): Promise<void> {
    try {
      await this.redisClient.flushDb();
      this.logger.warn('Cache cleared - all keys deleted');
    } catch (error) {
      this.logger.error('Failed to clear cache:', error);
      throw new Error(
        `Cache clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get cache statistics and info
   */
  async getInfo(): Promise<string> {
    try {
      const info = await this.redisClient.info();
      return info;
    } catch (error) {
      this.logger.error('Failed to get Redis info:', error);
      throw new Error(
        `Cache info failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Test Redis connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const testKey = 'health-check-test';
      const testValue = 'test-value';

      // Set a test value
      await this.set(testKey, testValue, 10); // 10 seconds expiration

      // Get the test value
      const result = await this.get(testKey);

      // Clean up
      await this.delete(testKey);

      return result === testValue;
    } catch (error) {
      this.logger.error('Redis connection test failed:', error);
      return false;
    }
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.isConnected && this.redisClient.isOpen;
  }
}
