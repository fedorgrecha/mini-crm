import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadsService } from './leads.service';
import { Lead, LeadStatus } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
});

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: MockRepository<Lead>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get<MockRepository<Lead>>(getRepositoryToken(Lead));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const createLeadDto: CreateLeadDto = {
        title: 'Test Lead',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '1234567890',
      };

      const lead = {
        id: 'test-id',
        ...createLeadDto,
        status: LeadStatus.NEW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create.mockReturnValue(lead);
      repository.save.mockResolvedValue(lead);

      const result = await service.create(createLeadDto);
      expect(result).toEqual(lead);
      expect(repository.create).toHaveBeenCalledWith(createLeadDto);
      expect(repository.save).toHaveBeenCalledWith(lead);
    });
  });

  describe('findAll', () => {
    it('should return an array of leads and count', async () => {
      const leads = [
        {
          id: 'test-id-1',
          title: 'Test Lead 1',
          clientName: 'John Doe',
          status: LeadStatus.NEW,
        },
        {
          id: 'test-id-2',
          title: 'Test Lead 2',
          clientName: 'Jane Doe',
          status: LeadStatus.IN_WORK,
        },
      ];
      const total = 2;

      repository.findAndCount.mockResolvedValue([leads, total]);

      const result = await service.findAll({});
      expect(result).toEqual({ items: leads, total });
      expect(repository.findAndCount).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      const filterDto = {
        title: 'Test',
        clientName: 'John',
        status: LeadStatus.NEW,
      };

      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(filterDto);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: expect.anything(),
            clientName: expect.anything(),
            status: LeadStatus.NEW,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a lead if found', async () => {
      const lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        status: LeadStatus.NEW,
      };

      repository.findOne.mockResolvedValue(lead);

      const result = await service.findOne('test-id');
      expect(result).toEqual(lead);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should throw NotFoundException if lead not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('test-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a lead', async () => {
      const updateLeadDto: UpdateLeadDto = {
        title: 'Updated Lead',
      };

      const existingLead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        status: LeadStatus.NEW,
      };

      const updatedLead = {
        ...existingLead,
        ...updateLeadDto,
      };

      repository.findOne.mockResolvedValue(existingLead);
      repository.save.mockResolvedValue(updatedLead);

      const result = await service.update('test-id', updateLeadDto);
      expect(result).toEqual(updatedLead);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(repository.save).toHaveBeenCalledWith(updatedLead);
    });
  });

  describe('remove', () => {
    it('should remove a lead', async () => {
      const lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        status: LeadStatus.NEW,
      };

      repository.findOne.mockResolvedValue(lead);
      repository.remove.mockResolvedValue(lead);

      await service.remove('test-id');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(repository.remove).toHaveBeenCalledWith(lead);
    });
  });

  describe('updateStatus', () => {
    it('should update lead status from NEW to IN_WORK', async () => {
      const lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        status: LeadStatus.NEW,
      };

      const updatedLead = {
        ...lead,
        status: LeadStatus.IN_WORK,
      };

      repository.findOne.mockResolvedValue(lead);
      repository.save.mockResolvedValue(updatedLead);

      const result = await service.updateStatus('test-id', LeadStatus.IN_WORK);
      expect(result).toEqual(updatedLead);
      expect(repository.save).toHaveBeenCalledWith(updatedLead);
    });

    it('should update lead status from IN_WORK to WON', async () => {
      const lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        status: LeadStatus.IN_WORK,
      };

      const updatedLead = {
        ...lead,
        status: LeadStatus.WON,
      };

      repository.findOne.mockResolvedValue(lead);
      repository.save.mockResolvedValue(updatedLead);

      const result = await service.updateStatus('test-id', LeadStatus.WON);
      expect(result).toEqual(updatedLead);
      expect(repository.save).toHaveBeenCalledWith(updatedLead);
    });

    it('should throw BadRequestException when trying to move from NEW to WON', async () => {
      const lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        status: LeadStatus.NEW,
      };

      repository.findOne.mockResolvedValue(lead);

      await expect(
        service.updateStatus('test-id', LeadStatus.WON),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to move from NEW to LOST', async () => {
      const lead = {
        id: 'test-id',
        title: 'Test Lead',
        clientName: 'John Doe',
        status: LeadStatus.NEW,
      };

      repository.findOne.mockResolvedValue(lead);

      await expect(
        service.updateStatus('test-id', LeadStatus.LOST),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
