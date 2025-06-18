import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Lead title',
    example: 'New website development',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title: string;

  @ApiProperty({ description: 'Client name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  clientName: string;

  @ApiPropertyOptional({
    description: 'Client email',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @ApiPropertyOptional({
    description: 'Client phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  @Length(5, 20)
  clientPhone?: string;

  @ApiPropertyOptional({
    description: 'Lead description',
    example: 'Client needs a new e-commerce website',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Lead status',
    enum: LeadStatus,
    default: LeadStatus.NEW,
    example: LeadStatus.NEW,
  })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Potential value of the lead',
    example: 5000.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;
}
