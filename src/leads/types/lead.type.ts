import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { LeadStatus } from '../entities/lead.entity';

export class LeadResponse {
  @ApiProperty({ description: 'Lead ID' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Lead title' })
  @Expose()
  title!: string;

  @ApiProperty({ description: 'Client name' })
  @Expose()
  clientName!: string;

  @ApiProperty({ description: 'Client email' })
  @Expose()
  clientEmail?: string;

  @ApiProperty({ description: 'Client phone number' })
  @Expose()
  clientPhone?: string;

  @ApiProperty({ description: 'Lead description' })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Lead status',
    enum: LeadStatus,
  })
  @Expose()
  status!: LeadStatus;

  @ApiProperty({ description: 'Potential value of the lead' })
  @Expose()
  value?: number;

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  updatedAt!: Date;
}
