import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RouterModule.register([
      {
        path: 'api/v1',
        module: UsersModule,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
