import { Lead } from '../entities/lead.entity';

export class LeadCreatedEvent {
  constructor(public readonly lead: Lead) {}
}
