import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ExecutionContext } from '@nestjs/common';
import { GraphQLContext } from '../auth/types/graphql-context.interface';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    // Check if it's a GraphQL context
    if (context.getType<string>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<GraphQLContext>();

      return { req: ctx.req, res: ctx.res };
    }

    // For REST, use the default implementation
    return super.getRequestResponse(context);
  }
}
