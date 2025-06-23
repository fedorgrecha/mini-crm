import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { LeadStatus } from '../entities/lead.entity';
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
import { Expose } from 'class-transformer';

@InputType()
export class CreateLeadInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Expose()
  title!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Expose()
  clientName!: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  @Expose()
  clientEmail?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Length(5, 20)
  @Expose()
  clientPhone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @Field(() => LeadStatus, { nullable: true })
  @IsEnum(LeadStatus)
  @IsOptional()
  @Expose()
  status?: LeadStatus;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Expose()
  value?: number;
}

@InputType()
export class UpdateLeadInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  clientName?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Length(5, 20)
  clientPhone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => LeadStatus, { nullable: true })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;
}

@InputType()
export class FilterLeadsInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  id?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  clientName?: string;

  @Field(() => LeadStatus, { nullable: true })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;
}
