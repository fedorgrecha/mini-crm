import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LeadCreatedEvent } from './events/lead-created.event';
import { LeadStatusChangedEvent } from './events/lead-status-changed.event';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';

@WebSocketGateway({
  namespace: 'leads',
  path: '/leads/subscribe',
  cors: {
    origin: '*',
  },
})
export class LeadsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(LeadsGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log('Leads WebSocket Gateway initialized');
  }

  @UseGuards(WsAuthGuard)
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent('lead.created')
  handleLeadCreatedEvent(event: LeadCreatedEvent) {
    this.server.emit('leadCreated', {
      lead: event.lead,
    });
  }

  @OnEvent('lead.statusChanged')
  handleLeadStatusChangedEvent(event: LeadStatusChangedEvent) {
    this.server.emit('leadStatusChanged', {
      lead: event.lead,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
    });
  }
}
