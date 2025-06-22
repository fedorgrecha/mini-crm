import { Test, TestingModule } from '@nestjs/testing';
import { LeadsResolver } from './leads.resolver';
import { LeadsService } from './leads.service';
import { Lead, LeadStatus } from './entities/lead.entity';
import {
  CreateLeadInput,
  UpdateLeadInput,
  FilterLeadsInput,
} from './models/lead.input';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('LeadsResolver', () => {
  let resolver: LeadsResolver;

  const mockLead: Lead = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Lead',
    clientName: 'Test Client',
    clientEmail: 'test@example.com',
    clientPhone: '1234567890',
    description: 'Test description',
    status: LeadStatus.NEW,
    value: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLeadsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsResolver,
        {
          provide: LeadsService,
          useValue: mockLeadsService,
        },
      ],
    }).compile();

    resolver = module.get<LeadsResolver>(LeadsResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('lead', () => {
    it('should return a lead by id', async () => {
      mockLeadsService.findOne.mockResolvedValue(mockLead);

      const result = await resolver.lead(
        '123e4567-e89b-12d3-a456-426614174000',
      );

      expect(mockLeadsService.findOne).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockLead.id,
          title: mockLead.title,
        }),
      );
    });

    it('should throw NotFoundException if lead not found', async () => {
      mockLeadsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(resolver.lead('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('leads', () => {
    it('should return all leads with pagination', async () => {
      const mockFilter: FilterLeadsInput = { page: 1, limit: 10 };
      const mockResponse = {
        items: [mockLead],
        total: 1,
      };

      mockLeadsService.findAll.mockResolvedValue(mockResponse);

      const result = await resolver.leads(mockFilter);

      expect(mockLeadsService.findAll).toHaveBeenCalledWith(mockFilter);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('createLead', () => {
    it('should create a new lead', async () => {
      const createLeadInput: CreateLeadInput = {
        title: 'New Lead',
        clientName: 'New Client',
      };

      mockLeadsService.create.mockResolvedValue({
        ...mockLead,
        title: createLeadInput.title,
        clientName: createLeadInput.clientName,
      });

      const result = await resolver.createLead(createLeadInput);

      expect(mockLeadsService.create).toHaveBeenCalledWith(createLeadInput);
      expect(result.title).toBe(createLeadInput.title);
      expect(result.clientName).toBe(createLeadInput.clientName);
    });
  });

  describe('updateLead', () => {
    it('should update a lead', async () => {
      const updateLeadInput: UpdateLeadInput = {
        title: 'Updated Lead',
      };

      const updatedLead = {
        ...mockLead,
        title: updateLeadInput.title,
      };

      mockLeadsService.update.mockResolvedValue(updatedLead);

      const result = await resolver.updateLead(mockLead.id, updateLeadInput);

      expect(mockLeadsService.update).toHaveBeenCalledWith(
        mockLead.id,
        updateLeadInput,
      );
      expect(result.title).toBe(updateLeadInput.title);
    });

    it('should throw NotFoundException if lead not found', async () => {
      mockLeadsService.update.mockRejectedValue(new NotFoundException());

      await expect(
        resolver.updateLead('non-existent-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeLead', () => {
    it('should remove a lead', async () => {
      mockLeadsService.remove.mockResolvedValue(undefined);

      const result = await resolver.removeLead(mockLead.id);

      expect(mockLeadsService.remove).toHaveBeenCalledWith(mockLead.id);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if lead not found', async () => {
      mockLeadsService.remove.mockRejectedValue(new NotFoundException());

      await expect(resolver.removeLead('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('moveLeadToInWork', () => {
    it('should move a lead to InWork status', async () => {
      const updatedLead = {
        ...mockLead,
        status: LeadStatus.IN_WORK,
      };

      mockLeadsService.updateStatus.mockResolvedValue(updatedLead);

      const result = await resolver.moveLeadToInWork(mockLead.id);

      expect(mockLeadsService.updateStatus).toHaveBeenCalledWith(
        mockLead.id,
        LeadStatus.IN_WORK,
      );
      expect(result.status).toBe(LeadStatus.IN_WORK);
    });

    it('should throw BadRequestException if status transition is invalid', async () => {
      mockLeadsService.updateStatus.mockRejectedValue(
        new BadRequestException(),
      );

      await expect(resolver.moveLeadToInWork(mockLead.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('markLeadAsWon', () => {
    it('should mark a lead as Won', async () => {
      const updatedLead = {
        ...mockLead,
        status: LeadStatus.WON,
      };

      mockLeadsService.updateStatus.mockResolvedValue(updatedLead);

      const result = await resolver.markLeadAsWon(mockLead.id);

      expect(mockLeadsService.updateStatus).toHaveBeenCalledWith(
        mockLead.id,
        LeadStatus.WON,
      );
      expect(result.status).toBe(LeadStatus.WON);
    });
  });

  describe('markLeadAsLost', () => {
    it('should mark a lead as Lost', async () => {
      const updatedLead = {
        ...mockLead,
        status: LeadStatus.LOST,
      };

      mockLeadsService.updateStatus.mockResolvedValue(updatedLead);

      const result = await resolver.markLeadAsLost(mockLead.id);

      expect(mockLeadsService.updateStatus).toHaveBeenCalledWith(
        mockLead.id,
        LeadStatus.LOST,
      );
      expect(result.status).toBe(LeadStatus.LOST);
    });
  });
});
