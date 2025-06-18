import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/userRole';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { LeadResponse } from './types/lead.type';
import { Lead, LeadStatus } from './entities/lead.entity';

@ApiTags('leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @ApiOperation({ summary: 'Create lead' })
  @ApiResponse({ status: HttpStatus.CREATED, type: LeadResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() createLeadDto: CreateLeadDto): Promise<LeadResponse> {
    const lead: Lead = await this.leadsService.create(createLeadDto);
    return plainToClass(LeadResponse, lead, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Get all leads' })
  @ApiResponse({ status: HttpStatus.OK, type: [LeadResponse] })
  @HttpCode(HttpStatus.OK)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(
    @Query() filterDto: FilterLeadsDto,
  ): Promise<{ items: LeadResponse[]; total: number }> {
    const { items, total } = await this.leadsService.findAll(filterDto);
    return {
      items: items.map((lead) =>
        plainToClass(LeadResponse, lead, {
          excludeExtraneousValues: true,
        }),
      ),
      total,
    };
  }

  @ApiOperation({ summary: 'Get lead by id' })
  @ApiResponse({ status: HttpStatus.OK, type: LeadResponse })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findOne(@Param('id') id: string): Promise<LeadResponse> {
    const lead: Lead = await this.leadsService.findOne(id);
    return plainToClass(LeadResponse, lead, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: HttpStatus.OK, type: LeadResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ): Promise<LeadResponse> {
    const lead: Lead = await this.leadsService.update(id, updateLeadDto);
    return plainToClass(LeadResponse, lead, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async remove(@Param('id') id: string): Promise<void> {
    return this.leadsService.remove(id);
  }

  @ApiOperation({ summary: 'Move lead to InWork status' })
  @ApiResponse({ status: HttpStatus.OK, type: LeadResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/in-work')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async moveToInWork(@Param('id') id: string): Promise<LeadResponse> {
    const lead: Lead = await this.leadsService.updateStatus(
      id,
      LeadStatus.IN_WORK,
    );
    return plainToClass(LeadResponse, lead, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Mark lead as Won' })
  @ApiResponse({ status: HttpStatus.OK, type: LeadResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/won')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async markAsWon(@Param('id') id: string): Promise<LeadResponse> {
    const lead: Lead = await this.leadsService.updateStatus(id, LeadStatus.WON);
    return plainToClass(LeadResponse, lead, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Mark lead as Lost' })
  @ApiResponse({ status: HttpStatus.OK, type: LeadResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/lost')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async markAsLost(@Param('id') id: string): Promise<LeadResponse> {
    const lead: Lead = await this.leadsService.updateStatus(
      id,
      LeadStatus.LOST,
    );
    return plainToClass(LeadResponse, lead, {
      excludeExtraneousValues: true,
    });
  }
}
