import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/enums/userRole';

export interface JwtPayload {
  sub: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthResponseDto implements AuthTokens {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
