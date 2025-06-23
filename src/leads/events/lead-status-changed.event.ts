import { Lead, LeadStatus } from '../entities/lead.entity';

export class LeadStatusChangedEvent {
  constructor(
    public readonly lead: Lead,
    public readonly previousStatus: LeadStatus,
    public readonly newStatus: LeadStatus,
  ) {}
}
