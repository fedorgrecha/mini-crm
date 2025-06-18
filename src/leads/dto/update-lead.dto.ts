import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { CreateLeadDto } from './create-lead.dto';
import { LeadStatus } from '../entities/lead.entity';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiPropertyOptional({
    description: 'Lead title',
    example: 'Updated website development',
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  title?: string;

  @ApiPropertyOptional({ description: 'Client name', example: 'John Smith' })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Client email',
    example: 'john.smith@example.com',
  })
  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @ApiPropertyOptional({
    description: 'Client phone number',
    example: '+0987654321',
  })
  @IsString()
  @IsOptional()
  @Length(5, 20)
  clientPhone?: string;

  @ApiPropertyOptional({
    description: 'Lead description',
    example: 'Client needs a new e-commerce website with payment integration',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Lead status',
    enum: LeadStatus,
    example: LeadStatus.IN_WORK,
  })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Potential value of the lead',
    example: 7500.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;
}
