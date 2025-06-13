import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
    enum: ['user', 'admin'],
  })
  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;

  @ApiProperty({ description: 'Account verification status' })
  @Prop({ default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Account active status' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'User subscription plan', example: 'free' })
  @Prop({ default: 'free', enum: ['free', 'basic', 'premium'] })
  subscriptionPlan: string;

  @ApiProperty({ description: 'Subscription expiry date' })
  @Prop()
  subscriptionExpiry?: Date;

  @ApiProperty({ description: 'Account creation date' })
  createdAt?: Date;

  @ApiProperty({ description: 'Last account update date' })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
