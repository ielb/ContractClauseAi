import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @ApiProperty({ description: 'User who performed the action' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'Action performed',
    example: 'CONTRACT_UPLOADED',
  })
  @Prop({ required: true })
  action: string;

  @ApiProperty({ description: 'Resource type affected', example: 'contract' })
  @Prop({ required: true, enum: ['user', 'contract', 'analysis', 'system'] })
  resourceType: string;

  @ApiProperty({ description: 'ID of the affected resource' })
  @Prop()
  resourceId?: string;

  @ApiProperty({ description: 'Additional action details' })
  @Prop({ type: Object })
  details?: Record<string, any>;

  @ApiProperty({ description: 'IP address of the user' })
  @Prop()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent string' })
  @Prop()
  userAgent?: string;

  @ApiProperty({ description: 'Action result', example: 'success' })
  @Prop({ required: true, enum: ['success', 'failure', 'error'] })
  result: string;

  @ApiProperty({ description: 'Error message if action failed' })
  @Prop()
  errorMessage?: string;

  @ApiProperty({ description: 'Session ID for tracking user sessions' })
  @Prop()
  sessionId?: string;

  @ApiProperty({ description: 'Action timestamp' })
  createdAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
