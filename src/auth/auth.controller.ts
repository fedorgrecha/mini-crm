import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthTokens, AuthResponseDto } from './types/auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AuthResponseDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signup(@Body() input: RegisterUserDto): Promise<AuthTokens> {
    return this.authService.signup(input);
  }

  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<AuthTokens> {
    return this.authService.login(loginDto);
  }

  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
}
