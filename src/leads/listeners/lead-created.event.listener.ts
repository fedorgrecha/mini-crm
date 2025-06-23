import { OnEvent } from '@nestjs/event-emitter';
import { LeadCreatedEvent } from '../events/lead-created.event';
import { Logger } from '@nestjs/common';

export class LeadCreatedEventListener {
  private readonly logger = new Logger();

  @OnEvent('lead.created')
  handle(payload: LeadCreatedEvent) {
    this.logger.log(
      `Processing lead.created event for lead ${payload.lead.id}`,
    );
  }
}
