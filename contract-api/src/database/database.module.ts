import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { User, UserSchema } from '../schemas/user.schema';
import { Contract, ContractSchema } from '../schemas/contract.schema';
import {
  AnalysisResult,
  AnalysisResultSchema,
} from '../schemas/analysis-result.schema';
import { AuditLog, AuditLogSchema } from '../schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('database.url');
        const dbName = configService.get<string>('database.name');

        return {
          uri,
          dbName,
          // Connection pooling settings
          maxPoolSize: 10,
          minPoolSize: 5,
          maxIdleTimeMS: 30000,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          // Enable compression
          compressors: ['zlib'],
          // Retry settings
          retryWrites: true,
          retryReads: true,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: AnalysisResult.name, schema: AnalysisResultSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
