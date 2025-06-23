import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { LeadStatusChangedEvent } from '../events/lead-status-changed.event';

export class LeadStatusChangedEventListener {
  private readonly logger = new Logger();

  @OnEvent('lead.statusChanged')
  handle(payload: LeadStatusChangedEvent) {
    this.logger.log(
      `Processing lead.statusChanged event for lead ${payload.lead.id}`,
    );
  }
}
