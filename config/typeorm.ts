import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join as pathJoin } from 'path';

config();

const baseConfig = {
  type: 'mysql' as const,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [pathJoin(__dirname, '../src/**/*.entity{.ts,.js}')],
  migrations: [pathJoin(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false,
  logging: false,
};

export const typeOrmConfigFactory = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  ...baseConfig,
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'test',
  logging: process.env.NODE_ENV === 'development',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
});

export default new DataSource(baseConfig);
