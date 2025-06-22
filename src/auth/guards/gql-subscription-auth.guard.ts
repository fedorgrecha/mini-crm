import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/auth.types';
import { GraphQLSubscriptionContext } from '../types/graphql-context.interface';

@Injectable()
export class GqlSubscriptionAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const contextData = ctx.getContext<GraphQLSubscriptionContext>();
    const req = contextData.req as { extra: { token: string } };
    const extra = req.extra;
    const token = extra?.token;

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: jwtSecret,
      });

      const user = await this.usersService.findOne(payload.sub);

      // Add user to context for role-based authorization
      contextData.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
