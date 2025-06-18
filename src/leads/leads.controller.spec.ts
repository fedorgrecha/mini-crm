import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead, LeadStatus } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { plainToClass } from 'class-transformer';
import { LeadResponse } from './types/lead.type';

describe('LeadsController', () => {
  let controller: LeadsController;

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
      controllers: [LeadsController],
      providers: [
        {
          provide: LeadsService,
          useValue: mockLeadsService,
        },
      ],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const createLeadDto: CreateLeadDto = {
        title: 'Test Lead',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '1234567890',
      };

      const lead: Lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '1234567890',
        description: '',
        status: LeadStatus.NEW,
        value: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeadsService.create.mockResolvedValue(lead);

      const result = await controller.create(createLeadDto);
      expect(result).toEqual(
        plainToClass(LeadResponse, lead, { excludeExtraneousValues: true }),
      );
      expect(mockLeadsService.create).toHaveBeenCalledWith(createLeadDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of leads', async () => {
      const filterDto: FilterLeadsDto = {
        page: 1,
        limit: 10,
      };

      const leads: Lead[] = [
        {
          id: 'test-id-1',
          title: 'Test Lead 1',
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          clientPhone: '1234567890',
          description: '',
          status: LeadStatus.NEW,
          value: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-id-2',
          title: 'Test Lead 2',
          clientName: 'Jane Doe',
          clientEmail: 'jane@example.com',
          clientPhone: '0987654321',
          description: '',
          status: LeadStatus.IN_WORK,
          value: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockLeadsService.findAll.mockResolvedValue({ items: leads, total: 2 });

      const result = await controller.findAll(filterDto);
      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
      expect(mockLeadsService.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a lead by id', async () => {
      const lead: Lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '1234567890',
        description: '',
        status: LeadStatus.NEW,
        value: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeadsService.findOne.mockResolvedValue(lead);

      const result = await controller.findOne('test-id');
      expect(result).toEqual(
        plainToClass(LeadResponse, lead, { excludeExtraneousValues: true }),
      );
      expect(mockLeadsService.findOne).toHaveBeenCalledWith('test-id');
    });
  });

  describe('update', () => {
    it('should update a lead', async () => {
      const updateLeadDto: UpdateLeadDto = {
        title: 'Updated Lead',
      };

      const lead: Lead = {
        id: 'test-id',
        title: 'Updated Lead',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '1234567890',
        description: '',
        status: LeadStatus.NEW,
        value: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeadsService.update.mockResolvedValue(lead);

      const result = await controller.update('test-id', updateLeadDto);
      expect(result).toEqual(
        plainToClass(LeadResponse, lead, { excludeExtraneousValues: true }),
      );
      expect(mockLeadsService.update).toHaveBeenCalledWith(
        'test-id',
        updateLeadDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a lead', async () => {
      await controller.remove('test-id');
      expect(mockLeadsService.remove).toHaveBeenCalledWith('test-id');
    });
  });

  describe('moveToInWork', () => {
    it('should move a lead to InWork status', async () => {
      const lead: Lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '1234567890',
        description: '',
        status: LeadStatus.IN_WORK,
        value: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeadsService.updateStatus.mockResolvedValue(lead);

      const result = await controller.moveToInWork('test-id');
      expect(result).toEqual(
        plainToClass(LeadResponse, lead, { excludeExtraneousValues: true }),
      );
      expect(mockLeadsService.updateStatus).toHaveBeenCalledWith(
        'test-id',
        LeadStatus.IN_WORK,
      );
    });
  });

  describe('markAsWon', () => {
    it('should mark a lead as Won', async () => {
      const lead: Lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '1234567890',
        description: '',
        status: LeadStatus.WON,
        value: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeadsService.updateStatus.mockResolvedValue(lead);

      const result = await controller.markAsWon('test-id');
      expect(result).toEqual(
        plainToClass(LeadResponse, lead, { excludeExtraneousValues: true }),
      );
      expect(mockLeadsService.updateStatus).toHaveBeenCalledWith(
        'test-id',
        LeadStatus.WON,
      );
    });
  });

  describe('markAsLost', () => {
    it('should mark a lead as Lost', async () => {
      const lead: Lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '1234567890',
        description: '',
        status: LeadStatus.LOST,
        value: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLeadsService.updateStatus.mockResolvedValue(lead);

      const result = await controller.markAsLost('test-id');
      expect(result).toEqual(
        plainToClass(LeadResponse, lead, { excludeExtraneousValues: true }),
      );
      expect(mockLeadsService.updateStatus).toHaveBeenCalledWith(
        'test-id',
        LeadStatus.LOST,
      );
    });
  });
});
