import { AuthenticatedUser, RequestWithUser } from './auth.types';

export interface GraphQLContext {
  req: RequestWithUser;
}

export interface GraphQLSubscriptionContext {
  req: any;
  token?: string;
  user?: AuthenticatedUser;
}
