import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CustomerFileResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  filename!: string;

  @ApiProperty()
  @Expose()
  originalname!: string;

  @ApiProperty()
  @Expose()
  mimetype!: string;

  @ApiProperty()
  @Expose()
  size!: number;

  @ApiProperty()
  @Expose()
  customerId!: string;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
