import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ContractDocument = Contract & Document;

@Schema({ timestamps: true })
export class Contract {
  @ApiProperty({
    description: 'Contract title/name',
    example: 'Service Agreement - ABC Corp',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Original filename', example: 'contract.pdf' })
  @Prop({ required: true })
  originalFileName: string;

  @ApiProperty({
    description: 'File type',
    example: 'pdf',
    enum: ['pdf', 'doc', 'docx', 'txt'],
  })
  @Prop({ required: true, enum: ['pdf', 'doc', 'docx', 'txt', 'image'] })
  fileType: string;

  @ApiProperty({ description: 'File size in bytes', example: 1024000 })
  @Prop({ required: true })
  fileSize: number;

  @ApiProperty({ description: 'S3 file URL or path' })
  @Prop({ required: true })
  filePath: string;

  @ApiProperty({ description: 'Extracted text content from the contract' })
  @Prop({ type: String })
  extractedText?: string;

  @ApiProperty({ description: 'Contract type', example: 'service_agreement' })
  @Prop({
    enum: [
      'service_agreement',
      'employment',
      'nda',
      'lease',
      'purchase',
      'partnership',
      'other',
    ],
    default: 'other',
  })
  contractType: string;

  @ApiProperty({ description: 'Contract status', example: 'uploaded' })
  @Prop({
    enum: ['uploaded', 'processing', 'analyzed', 'error'],
    default: 'uploaded',
  })
  status: string;

  @ApiProperty({ description: 'Processing error message if any' })
  @Prop()
  errorMessage?: string;

  @ApiProperty({ description: 'User who uploaded the contract' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Contract tags for organization' })
  @Prop([String])
  tags: string[];

  @ApiProperty({ description: 'Whether contract is archived' })
  @Prop({ default: false })
  isArchived: boolean;

  @ApiProperty({ description: 'Upload date' })
  createdAt?: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt?: Date;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
