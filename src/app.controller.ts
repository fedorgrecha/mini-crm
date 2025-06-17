import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({ status: HttpStatus.OK, type: 'object' })
  @HttpCode(HttpStatus.OK)
  @Get('health')
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
