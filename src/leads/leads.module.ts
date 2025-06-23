import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadsResolver } from './leads.resolver';
import { Lead } from './entities/lead.entity';
import { RouterModule } from '@nestjs/core';
import { PubSub } from 'graphql-subscriptions';
import { AuthModule } from '../auth/auth.module';
import { LeadsSubscriptionResolver } from './leads.subscriptions.resolver';
import { LeadsGateway } from './leads.gateway';
import { BullModule } from '@nestjs/bullmq';
import { LeadCreatedEventListener } from './listeners/lead-created.event.listener';
import { LeadStatusChangedEventListener } from './listeners/lead-status-changed.event.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
    RouterModule.register([
      {
        path: 'api/v1',
        module: LeadsModule,
      },
    ]),
    BullModule.registerQueue({
      name: 'leads',
    }),
    AuthModule,
  ],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadsResolver,
    LeadCreatedEventListener,
    LeadStatusChangedEventListener,
    LeadsSubscriptionResolver,
    LeadsGateway,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [LeadsService],
})
export class LeadsModule {}
