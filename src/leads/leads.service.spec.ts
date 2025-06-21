import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lead, LeadStatus } from './entities/lead.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { Like } from 'typeorm';

describe('LeadsService', () => {
  let service: LeadsService;

  const mockLead: Lead = {
    id: 'test-id',
    title: 'Test Lead',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '1234567890',
    description: 'Test description',
    status: LeadStatus.NEW,
    value: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLeadRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: mockLeadRepository,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a lead', async () => {
      const createLeadDto: CreateLeadDto = {
        title: 'Test Lead',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientPhone: '1234567890',
      };

      mockLeadRepository.create.mockReturnValue(mockLead);
      mockLeadRepository.save.mockResolvedValue(mockLead);

      const result = await service.create(createLeadDto);

      expect(mockLeadRepository.create).toHaveBeenCalledWith(createLeadDto);
      expect(mockLeadRepository.save).toHaveBeenCalledWith(mockLead);
      expect(result).toEqual(mockLead);
    });
  });

  describe('findAll', () => {
    it('should return leads with pagination', async () => {
      const filterDto: FilterLeadsDto = {
        page: 1,
        limit: 10,
      };

      mockLeadRepository.findAndCount.mockResolvedValue([[mockLead], 1]);

      const result = await service.findAll(filterDto);

      expect(mockLeadRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual({ items: [mockLead], total: 1 });
    });

    it('should filter leads by id', async () => {
      const filterDto: FilterLeadsDto = {
        id: 'test-id',
        page: 1,
        limit: 10,
      };

      mockLeadRepository.findAndCount.mockResolvedValue([[mockLead], 1]);

      const result = await service.findAll(filterDto);

      expect(mockLeadRepository.findAndCount).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual({ items: [mockLead], total: 1 });
    });

    it('should filter leads by title', async () => {
      const filterDto: FilterLeadsDto = {
        title: 'Test',
        page: 1,
        limit: 10,
      };

      mockLeadRepository.findAndCount.mockResolvedValue([[mockLead], 1]);

      const result = await service.findAll(filterDto);

      expect(mockLeadRepository.findAndCount).toHaveBeenCalledWith({
        where: { title: Like('%Test%') },
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual({ items: [mockLead], total: 1 });
    });

    it('should filter leads by clientName', async () => {
      const filterDto: FilterLeadsDto = {
        clientName: 'John',
        page: 1,
        limit: 10,
      };

      mockLeadRepository.findAndCount.mockResolvedValue([[mockLead], 1]);

      const result = await service.findAll(filterDto);

      expect(mockLeadRepository.findAndCount).toHaveBeenCalledWith({
        where: { clientName: Like('%John%') },
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual({ items: [mockLead], total: 1 });
    });

    it('should filter leads by status', async () => {
      const filterDto: FilterLeadsDto = {
        status: LeadStatus.NEW,
        page: 1,
        limit: 10,
      };

      mockLeadRepository.findAndCount.mockResolvedValue([[mockLead], 1]);

      const result = await service.findAll(filterDto);

      expect(mockLeadRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: LeadStatus.NEW },
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual({ items: [mockLead], total: 1 });
    });
  });

  describe('findOne', () => {
    it('should return a lead when lead exists', async () => {
      mockLeadRepository.findOne.mockResolvedValue(mockLead);

      const result = await service.findOne('test-id');

      expect(mockLeadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toEqual(mockLead);
    });

    it('should throw NotFoundException when lead does not exist', async () => {
      mockLeadRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return a lead', async () => {
      const updateLeadDto: UpdateLeadDto = {
        title: 'Updated Lead',
      };

      const updatedLead = { ...mockLead, title: 'Updated Lead' };

      mockLeadRepository.findOne.mockResolvedValue(mockLead);
      mockLeadRepository.save.mockResolvedValue(updatedLead);

      const result = await service.update('test-id', updateLeadDto);

      expect(mockLeadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(mockLeadRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedLead);
    });

    it('should throw NotFoundException when lead does not exist', async () => {
      mockLeadRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a lead', async () => {
      mockLeadRepository.findOne.mockResolvedValue(mockLead);
      mockLeadRepository.remove.mockResolvedValue(undefined);

      await service.remove('test-id');

      expect(mockLeadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(mockLeadRepository.remove).toHaveBeenCalledWith(mockLead);
    });

    it('should throw NotFoundException when lead does not exist', async () => {
      mockLeadRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update lead status from NEW to IN_WORK', async () => {
      const leadWithNewStatus = { ...mockLead, status: LeadStatus.NEW };
      const updatedLead = { ...mockLead, status: LeadStatus.IN_WORK };

      mockLeadRepository.findOne.mockResolvedValue(leadWithNewStatus);
      mockLeadRepository.save.mockResolvedValue(updatedLead);

      const result = await service.updateStatus('test-id', LeadStatus.IN_WORK);

      expect(mockLeadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(mockLeadRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedLead);
    });

    it('should update lead status from IN_WORK to WON', async () => {
      const leadWithInWorkStatus = { ...mockLead, status: LeadStatus.IN_WORK };
      const updatedLead = { ...mockLead, status: LeadStatus.WON };

      mockLeadRepository.findOne.mockResolvedValue(leadWithInWorkStatus);
      mockLeadRepository.save.mockResolvedValue(updatedLead);

      const result = await service.updateStatus('test-id', LeadStatus.WON);

      expect(mockLeadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(mockLeadRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedLead);
    });

    it('should update lead status from IN_WORK to LOST', async () => {
      const leadWithInWorkStatus = { ...mockLead, status: LeadStatus.IN_WORK };
      const updatedLead = { ...mockLead, status: LeadStatus.LOST };

      mockLeadRepository.findOne.mockResolvedValue(leadWithInWorkStatus);
      mockLeadRepository.save.mockResolvedValue(updatedLead);

      const result = await service.updateStatus('test-id', LeadStatus.LOST);

      expect(mockLeadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(mockLeadRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedLead);
    });

    it('should throw BadRequestException when trying to move from NEW to WON', async () => {
      const leadWithNewStatus = { ...mockLead, status: LeadStatus.NEW };

      mockLeadRepository.findOne.mockResolvedValue(leadWithNewStatus);

      await expect(
        service.updateStatus('test-id', LeadStatus.WON),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to move from NEW to LOST', async () => {
      const leadWithNewStatus = { ...mockLead, status: LeadStatus.NEW };

      mockLeadRepository.findOne.mockResolvedValue(leadWithNewStatus);

      await expect(
        service.updateStatus('test-id', LeadStatus.LOST),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when lead does not exist', async () => {
      mockLeadRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('non-existent-id', LeadStatus.IN_WORK),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
