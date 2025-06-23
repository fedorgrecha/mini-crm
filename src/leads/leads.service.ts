import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Lead, LeadStatus } from './entities/lead.entity';
import { LeadCreatedEvent } from './events/lead-created.event';
import { LeadStatusChangedEvent } from './events/lead-status-changed.event';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @Inject('PUB_SUB')
    private pubSub: PubSub,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadsRepository.create(createLeadDto);
    const savedLead = await this.leadsRepository.save(lead);

    // Publish event for lead creation (GraphQL subscription)
    await this.pubSub.publish('leadCreated', {
      leadCreated: { lead: savedLead },
    });

    this.eventEmitter.emit('lead.created', new LeadCreatedEvent(savedLead));

    return savedLead;
  }

  async findAll(
    filterDto: FilterLeadsDto,
  ): Promise<{ items: Lead[]; total: number }> {
    const { id, title, clientName, status, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Lead> = {};

    if (id) {
      where.id = id;
    }

    if (title) {
      where.title = Like(`%${title}%`);
    }

    if (clientName) {
      where.clientName = Like(`%${clientName}%`);
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await this.leadsRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return { items, total };
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadsRepository.findOne({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    Object.assign(lead, updateLeadDto);
    return await this.leadsRepository.save(lead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadsRepository.remove(lead);
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const lead = await this.findOne(id);

    // Validate status transition
    if (status === LeadStatus.IN_WORK && lead.status !== LeadStatus.NEW) {
      throw new BadRequestException(
        'Lead can only be moved to InWork from New status',
      );
    }

    if (
      (status === LeadStatus.WON || status === LeadStatus.LOST) &&
      lead.status !== LeadStatus.IN_WORK
    ) {
      throw new BadRequestException(
        'Lead can only be marked as Won or Lost from InWork status',
      );
    }

    const previousStatus = lead.status;
    lead.status = status;
    const updatedLead = await this.leadsRepository.save(lead);

    // Publish event for lead status change (GraphQL subscription)
    await this.pubSub.publish('leadStatusChanged', {
      leadStatusChanged: {
        lead: updatedLead,
        previousStatus,
        newStatus: status,
      },
    });

    this.eventEmitter.emit(
      'lead.statusChanged',
      new LeadStatusChangedEvent(updatedLead, previousStatus, status),
    );

    return updatedLead;
  }
}
