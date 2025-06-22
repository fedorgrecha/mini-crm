import { RequestWithUser } from './auth.types';

export interface GraphQLContext {
  req: RequestWithUser;
}
