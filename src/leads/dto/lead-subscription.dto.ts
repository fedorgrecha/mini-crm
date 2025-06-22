import { ObjectType, Field } from '@nestjs/graphql';
import { Lead } from '../models/lead.model';
import { LeadStatus } from '../entities/lead.entity';

@ObjectType()
export class LeadCreatedEvent {
  @Field(() => Lead)
  lead: Lead;
}

@ObjectType()
export class LeadStatusChangedEvent {
  @Field(() => Lead)
  lead: Lead;

  @Field(() => LeadStatus)
  previousStatus: LeadStatus;

  @Field(() => LeadStatus)
  newStatus: LeadStatus;
}
