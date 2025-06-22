import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CacheModule } from '@nestjs/cache-manager';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from './entities/customer.entity';
import { CustomerFile } from './entities/customer-file.entity';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerFile]),
    MulterModule.register({
      dest: './uploads/customers',
    }),
    CacheModule.register(),
    RouterModule.register([
      {
        path: 'api/v1',
        module: CustomersModule,
      },
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
