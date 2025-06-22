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

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
    RouterModule.register([
      {
        path: 'api/v1',
        module: LeadsModule,
      },
    ]),
    AuthModule,
  ],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadsResolver,
    LeadsSubscriptionResolver,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [LeadsService],
})
export class LeadsModule {}
