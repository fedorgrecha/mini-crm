import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
        },
      }),
    }),
    RouterModule.register([
      {
        path: 'api/v1',
        module: AuthModule,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, GqlAuthGuard],
  exports: [AuthService, JwtStrategy, RolesGuard, GqlAuthGuard],
})
export class AuthModule {}
