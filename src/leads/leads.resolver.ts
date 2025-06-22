import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/userRole';
import { LeadsService } from './leads.service';
import { Lead as LeadModel, LeadsResponse } from './models/lead.model';
import {
  CreateLeadInput,
  UpdateLeadInput,
  FilterLeadsInput,
} from './models/lead.input';
import { Lead, LeadStatus } from './entities/lead.entity';
import { plainToClass } from 'class-transformer';

@Resolver(() => LeadModel)
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsResolver {
  constructor(private readonly leadsService: LeadsService) {}

  @Query(() => LeadModel)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async lead(@Args('id', { type: () => ID }) id: string): Promise<LeadModel> {
    const lead: Lead = await this.leadsService.findOne(id);
    return plainToClass(LeadModel, lead, {
      excludeExtraneousValues: true,
    });
  }

  @Query(() => LeadsResponse)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async leads(
    @Args('filter', { nullable: true }) filter?: FilterLeadsInput,
  ): Promise<LeadsResponse> {
    const { items, total } = await this.leadsService.findAll(filter || {});
    return {
      items: items.map((lead) =>
        plainToClass(LeadModel, lead, {
          excludeExtraneousValues: true,
        }),
      ),
      total,
    };
  }

  @Mutation(() => LeadModel)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async createLead(@Args('input') input: CreateLeadInput): Promise<LeadModel> {
    const lead: Lead = await this.leadsService.create(input);
    return plainToClass(LeadModel, lead, {
      excludeExtraneousValues: true,
    });
  }

  @Mutation(() => LeadModel)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateLead(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLeadInput,
  ): Promise<LeadModel> {
    const lead: Lead = await this.leadsService.update(id, input);
    return plainToClass(LeadModel, lead, {
      excludeExtraneousValues: true,
    });
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async removeLead(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.leadsService.remove(id);
    return true;
  }

  @Mutation(() => LeadModel)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async moveLeadToInWork(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LeadModel> {
    const lead: Lead = await this.leadsService.updateStatus(
      id,
      LeadStatus.IN_WORK,
    );
    return plainToClass(LeadModel, lead, {
      excludeExtraneousValues: true,
    });
  }

  @Mutation(() => LeadModel)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async markLeadAsWon(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LeadModel> {
    const lead: Lead = await this.leadsService.updateStatus(id, LeadStatus.WON);
    return plainToClass(LeadModel, lead, {
      excludeExtraneousValues: true,
    });
  }

  @Mutation(() => LeadModel)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async markLeadAsLost(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LeadModel> {
    const lead: Lead = await this.leadsService.updateStatus(
      id,
      LeadStatus.LOST,
    );
    return plainToClass(LeadModel, lead, {
      excludeExtraneousValues: true,
    });
  }
}
