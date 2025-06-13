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

  @Prop({ select: false })
  emailVerificationToken?: string;

  @Prop({ select: false })
  emailVerificationExpires?: Date;

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetExpires?: Date;

  @ApiProperty({ description: 'User subscription plan', example: 'free' })
  @Prop({ default: 'free', enum: ['free', 'basic', 'premium'] })
  subscriptionPlan: string;

  @ApiProperty({ description: 'Subscription expiry date' })
  @Prop()
  subscriptionExpiry?: Date;

  // GDPR Compliance Fields
  @ApiProperty({ description: 'GDPR consent given date' })
  @Prop({ default: Date.now })
  gdprConsentDate: Date;

  @ApiProperty({ description: 'GDPR consent version accepted' })
  @Prop({ default: '1.0' })
  gdprConsentVersion: string;

  @ApiProperty({ description: 'Marketing consent status' })
  @Prop({ default: false })
  marketingConsent: boolean;

  @ApiProperty({ description: 'Analytics consent status' })
  @Prop({ default: false })
  analyticsConsent: boolean;

  @ApiProperty({ description: 'Data processing consent status' })
  @Prop({ default: true })
  dataProcessingConsent: boolean;

  @ApiProperty({ description: 'Data deletion request status' })
  @Prop({ default: false })
  deletionRequested: boolean;

  @ApiProperty({ description: 'Data deletion request date' })
  @Prop()
  deletionRequestDate?: Date;

  @ApiProperty({
    description: 'Scheduled deletion date (30 days after request)',
  })
  @Prop()
  scheduledDeletionDate?: Date;

  @ApiProperty({ description: 'Last data export date' })
  @Prop()
  lastDataExport?: Date;

  // Future Features Preparation
  @ApiProperty({ description: 'Multi-factor authentication enabled' })
  @Prop({ default: false })
  mfaEnabled: boolean;

  @Prop({ select: false })
  mfaSecret?: string;

  @ApiProperty({ description: 'Backup codes for MFA' })
  @Prop({ type: [String], select: false })
  mfaBackupCodes?: string[];

  @ApiProperty({ description: 'Subscription metadata for future features' })
  @Prop({ type: Object, default: {} })
  subscriptionMetadata: Record<string, any>;

  @ApiProperty({ description: 'User preferences for future customization' })
  @Prop({ type: Object, default: {} })
  preferences: Record<string, any>;

  @ApiProperty({ description: 'Account creation date' })
  createdAt?: Date;

  @ApiProperty({ description: 'Last account update date' })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
