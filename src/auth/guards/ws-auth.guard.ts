import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/auth.types';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const authHeader = client.handshake.headers.authorization;

    if (!authHeader) {
      throw new WsException('Authentication token is missing');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: jwtSecret,
      });

      await this.usersService.findOne(payload.sub);

      return true;
    } catch {
      throw new WsException('Invalid authentication token');
    }
  }
}
