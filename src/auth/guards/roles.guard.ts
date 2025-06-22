import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '../../users/enums/userRole';
import { AuthenticatedUser, RequestWithUser } from '../types/auth.types';
import { GraphQLContext } from '../types/graphql-context.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    let user: AuthenticatedUser;

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<RequestWithUser>();

      user = request.user;
    } else {
      // GraphQL context
      const ctx =
        GqlExecutionContext.create(context).getContext<GraphQLContext>();
      const request = ctx.req;

      user = request.user;
    }

    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
