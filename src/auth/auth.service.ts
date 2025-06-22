import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { User } from '../users/entities/user.entity';
import { AuthTokens, JwtPayload } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(input: RegisterUserDto): Promise<AuthTokens> {
    const user: User = await this.usersService.register(input);

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const user: null | User = await this.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.active) {
      throw new UnauthorizedException('User is inactive');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.active) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token refresh failed');
    }
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      return user;
    }

    return null;
  }

  private generateTokens(user: User): AuthTokens {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const jwtExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: jwtExpiresIn,
    });

    return { accessToken, refreshToken };
  }
}
