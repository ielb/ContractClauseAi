import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { StorageModule } from '../storage/storage.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [StorageModule, CacheModule],
  controllers: [TestController],
})
export class TestModule {}
