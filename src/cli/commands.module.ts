import { Module } from '@nestjs/common';
import { CreateAdminCommand } from './commands/create-admin.command';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfigFactory } from '../../config/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    UsersModule,
  ],
  providers: [CreateAdminCommand],
})
export class CommandsModule {}
