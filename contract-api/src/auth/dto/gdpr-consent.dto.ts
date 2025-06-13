import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConsentDto {
  @ApiProperty({
    description: 'Marketing consent status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiProperty({
    description: 'Analytics consent status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  analyticsConsent?: boolean;

  @ApiProperty({
    description: 'Data processing consent status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  dataProcessingConsent?: boolean;

  @ApiProperty({
    description: 'GDPR consent version being accepted',
    example: '2.0',
    required: false,
  })
  @IsOptional()
  @IsString()
  gdprConsentVersion?: string;
}

export class DataDeletionRequestDto {
  @ApiProperty({
    description: 'Reason for data deletion request',
    example: 'No longer need the service',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class DataExportRequestDto {
  @ApiProperty({
    description: 'Format for data export',
    example: 'json',
    enum: ['json', 'csv'],
    required: false,
  })
  @IsOptional()
  @IsString()
  format?: 'json' | 'csv';
}
