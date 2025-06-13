import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AnalysisResultDocument = AnalysisResult & Document;

@Schema()
export class ClauseAnalysis {
  @ApiProperty({ description: 'Clause text' })
  @Prop({ required: true })
  text: string;

  @ApiProperty({ description: 'Clause type', example: 'termination' })
  @Prop({ required: true })
  type: string;

  @ApiProperty({
    description: 'Risk level',
    example: 'medium',
    enum: ['low', 'medium', 'high'],
  })
  @Prop({ required: true, enum: ['low', 'medium', 'high'] })
  riskLevel: string;

  @ApiProperty({ description: 'AI confidence score (0-1)', example: 0.85 })
  @Prop({ required: true, min: 0, max: 1 })
  confidenceScore: number;

  @ApiProperty({ description: 'AI analysis and explanation' })
  @Prop({ required: true })
  analysis: string;

  @ApiProperty({ description: 'Suggested improvements or alternatives' })
  @Prop([String])
  suggestions: string[];

  @ApiProperty({ description: 'Position in the contract (character range)' })
  @Prop({
    type: {
      start: { type: Number, required: true },
      end: { type: Number, required: true },
    },
  })
  position: {
    start: number;
    end: number;
  };
}

@Schema({ timestamps: true })
export class AnalysisResult {
  @ApiProperty({ description: 'Associated contract ID' })
  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true })
  contractId: Types.ObjectId;

  @ApiProperty({ description: 'User who requested the analysis' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'Overall contract risk score (0-100)',
    example: 65,
  })
  @Prop({ required: true, min: 0, max: 100 })
  overallRiskScore: number;

  @ApiProperty({ description: 'Contract complexity level', example: 'medium' })
  @Prop({ required: true, enum: ['low', 'medium', 'high'] })
  complexityLevel: string;

  @ApiProperty({ description: 'Individual clause analyses' })
  @Prop([ClauseAnalysis])
  clauses: ClauseAnalysis[];

  @ApiProperty({ description: 'Key contract terms identified' })
  @Prop([
    {
      term: { type: String, required: true },
      value: { type: String, required: true },
      category: { type: String, required: true },
    },
  ])
  keyTerms: Array<{
    term: string;
    value: string;
    category: string;
  }>;

  @ApiProperty({ description: 'Red flags or major concerns' })
  @Prop([
    {
      issue: { type: String, required: true },
      severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical'],
      },
      description: { type: String, required: true },
      recommendation: { type: String, required: true },
    },
  ])
  redFlags: Array<{
    issue: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;

  @ApiProperty({ description: 'Overall contract summary' })
  @Prop({ required: true })
  summary: string;

  @ApiProperty({ description: 'AI model used for analysis', example: 'gpt-4o' })
  @Prop({ required: true })
  aiModel: string;

  @ApiProperty({ description: 'Analysis version for tracking improvements' })
  @Prop({ default: '1.0' })
  analysisVersion: string;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  @Prop()
  processingTime?: number;

  @ApiProperty({ description: 'Analysis completion date' })
  createdAt?: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt?: Date;
}

export const ClauseAnalysisSchema =
  SchemaFactory.createForClass(ClauseAnalysis);
export const AnalysisResultSchema =
  SchemaFactory.createForClass(AnalysisResult);
