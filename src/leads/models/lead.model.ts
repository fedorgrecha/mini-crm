import {
  Field,
  ID,
  ObjectType,
  registerEnumType,
  Float,
} from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { LeadStatus } from '../entities/lead.entity';

// Register the LeadStatus enum for GraphQL
registerEnumType(LeadStatus, {
  name: 'LeadStatus',
  description: 'The status of a lead',
});

@ObjectType()
export class Lead {
  @Field(() => ID)
  @Expose()
  id!: string;

  @Field()
  @Expose()
  title!: string;

  @Field()
  @Expose()
  clientName!: string;

  @Field({ nullable: true })
  @Expose()
  clientEmail?: string;

  @Field({ nullable: true })
  @Expose()
  clientPhone?: string;

  @Field({ nullable: true })
  @Expose()
  description?: string;

  @Field(() => LeadStatus)
  @Expose()
  status!: LeadStatus;

  @Field(() => Float, { nullable: true })
  @Expose()
  value?: number;

  @Field()
  @Expose()
  createdAt!: Date;

  @Field()
  @Expose()
  updatedAt!: Date;
}

@ObjectType()
export class LeadsResponse {
  @Field(() => [Lead])
  items: Lead[] = [];

  @Field()
  total!: number;
}
