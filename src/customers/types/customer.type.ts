import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CustomerFileResponse } from './customer-file.type';

export class CustomerResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  email!: string;

  @ApiProperty()
  @Expose()
  phone!: string;

  @ApiProperty()
  @Expose()
  active!: boolean;

  @ApiProperty({ type: [CustomerFileResponse] })
  @Expose()
  @Type(() => CustomerFileResponse)
  files: CustomerFileResponse[] = [];

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
