import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadsResolver } from './leads.resolver';
import { Lead } from './entities/lead.entity';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
    RouterModule.register([
      {
        path: 'api/v1',
        module: LeadsModule,
      },
    ]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsResolver],
  exports: [LeadsService],
})
export class LeadsModule {}
