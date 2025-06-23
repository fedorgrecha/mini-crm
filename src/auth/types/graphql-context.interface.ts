import { AuthenticatedUser, RequestWithUser } from './auth.types';

export interface GraphQLContext {
  req: RequestWithUser;
  res: Response;
}

export interface GraphQLSubscriptionContext {
  req: any;
  token?: string;
  user?: AuthenticatedUser;
}
