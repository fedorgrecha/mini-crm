import { Resolver, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { GqlSubscriptionAuthGuard } from '../auth/guards/gql-subscription-auth.guard';
import {
  LeadCreatedEvent,
  LeadStatusChangedEvent,
} from './dto/lead-subscription.dto';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLSubscriptionContext } from '../auth/types/graphql-context.interface';
import { SkipThrottle } from '@nestjs/throttler';

@Resolver()
@SkipThrottle()
export class LeadsSubscriptionResolver {
  constructor(
    @Inject('PUB_SUB')
    private pubSub: PubSub,
  ) {}

  @Subscription(() => LeadCreatedEvent, {
    filter: (payload, variables, context: GraphQLSubscriptionContext) => {
      // Check if user is authenticated (context.user is set by GqlSubscriptionAuthGuard)
      return !!context.user;
    },
  })
  @UseGuards(GqlSubscriptionAuthGuard)
  leadCreated() {
    return this.pubSub.asyncIterableIterator(['leadCreated']);
  }

  @Subscription(() => LeadStatusChangedEvent, {
    filter: (payload, variables, context: GraphQLSubscriptionContext) => {
      // Check if user is authenticated (context.user is set by GqlSubscriptionAuthGuard)
      return !!context.user;
    },
  })
  @UseGuards(GqlSubscriptionAuthGuard)
  leadStatusChanged() {
    return this.pubSub.asyncIterableIterator(['leadStatusChanged']);
  }
}
