import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterUsersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
