import { ObjectType, Field } from '@nestjs/graphql';
import { Lead } from '../models/lead.model';
import { LeadStatus } from '../entities/lead.entity';

@ObjectType()
export class LeadCreatedSubscription {
  @Field(() => Lead)
  lead!: Lead;
}

@ObjectType()
export class LeadStatusChangedSubscription {
  @Field(() => Lead)
  lead!: Lead;

  @Field(() => LeadStatus)
  previousStatus!: LeadStatus;

  @Field(() => LeadStatus)
  newStatus!: LeadStatus;
}
