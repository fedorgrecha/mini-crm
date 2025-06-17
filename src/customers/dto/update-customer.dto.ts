import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Length(1, 100)
  name?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Length(5, 20)
  phone?: string;

  @ApiProperty()
  @IsOptional()
  active?: boolean;
}
