import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { GdprService } from './gdpr.service';
import { GdprSchedulerService } from './gdpr-scheduler.service';
import { User, UserSchema } from '../schemas/user.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailModule,
  ],
  controllers: [UserController],
  providers: [UserService, GdprService, GdprSchedulerService],
  exports: [UserService, GdprService],
})
export class UserModule {}
