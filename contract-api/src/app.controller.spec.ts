import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageService } from './storage/storage.service';
import { CacheService } from './cache/cache.service';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockConnection = {
      readyState: 1,
      db: { databaseName: 'test' },
      host: 'localhost',
    };

    const mockStorageService = {
      testConnection: jest.fn().mockResolvedValue(true),
    };

    const mockCacheService = {
      testConnection: jest.fn().mockResolvedValue(true),
      isRedisConnected: jest.fn().mockReturnValue(true),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
