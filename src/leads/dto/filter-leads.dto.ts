import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeadStatus } from '../entities/lead.entity';

export class FilterLeadsDto {
  @ApiPropertyOptional({
    description: 'Lead ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Lead title (partial match)',
    example: 'website',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Client name (partial match)',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Lead status',
    enum: LeadStatus,
    example: LeadStatus.IN_WORK,
  })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
