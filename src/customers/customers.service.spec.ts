import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerFile } from './entities/customer-file.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomersDto } from './dto/filter-customers.dto';
import { Like } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');
jest.mock('util', () => ({
  promisify: jest.fn(),
}));

describe('CustomersService', () => {
  let service: CustomersService;

  const mockCustomer: Customer = {
    id: 'test-id',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '1234567890',
    active: true,
    files: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomerFile: CustomerFile = {
    id: 'file-id',
    filename: 'test-file.pdf',
    originalname: 'original-file.pdf',
    mimetype: 'application/pdf',
    path: '/uploads/customers/test-id/test-file.pdf',
    size: 1024,
    customer: mockCustomer,
    customerId: 'test-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockCustomerFileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(CustomerFile),
          useValue: mockCustomerFileRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a customer', async () => {
      const createCustomerDto: CreateCustomerDto = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      };

      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.create(createCustomerDto);

      expect(mockCustomerRepository.create).toHaveBeenCalledWith(
        createCustomerDto,
      );
      expect(mockCustomerRepository.save).toHaveBeenCalledWith(mockCustomer);
      expect(result).toEqual(mockCustomer);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const createCustomerDto: CreateCustomerDto = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      };

      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(service.create(createCustomerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return customers with pagination', async () => {
      const filterDto: FilterCustomersDto = {
        page: 1,
        limit: 10,
      };

      mockCustomerRepository.findAndCount.mockResolvedValue([
        [mockCustomer],
        1,
      ]);

      const result = await service.findAll(filterDto);

      expect(mockCustomerRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        relations: ['files'],
      });
      expect(result).toEqual({ items: [mockCustomer], total: 1 });
    });

    it('should filter customers by id', async () => {
      const filterDto: FilterCustomersDto = {
        id: 'test-id',
        page: 1,
        limit: 10,
      };

      mockCustomerRepository.findAndCount.mockResolvedValue([
        [mockCustomer],
        1,
      ]);

      const result = await service.findAll(filterDto);

      expect(mockCustomerRepository.findAndCount).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        skip: 0,
        take: 10,
        relations: ['files'],
      });
      expect(result).toEqual({ items: [mockCustomer], total: 1 });
    });

    it('should filter customers by email', async () => {
      const filterDto: FilterCustomersDto = {
        email: 'test',
        page: 1,
        limit: 10,
      };

      mockCustomerRepository.findAndCount.mockResolvedValue([
        [mockCustomer],
        1,
      ]);

      const result = await service.findAll(filterDto);

      expect(mockCustomerRepository.findAndCount).toHaveBeenCalledWith({
        where: { email: Like('%test%') },
        skip: 0,
        take: 10,
        relations: ['files'],
      });
      expect(result).toEqual({ items: [mockCustomer], total: 1 });
    });
  });

  describe('findOne', () => {
    it('should return a customer when customer exists', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findOne('test-id');

      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['files'],
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return a customer', async () => {
      const updateCustomerDto: UpdateCustomerDto = {
        name: 'Updated Name',
      };

      const updatedCustomer = { ...mockCustomer, name: 'Updated Name' };

      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update('test-id', updateCustomerDto);

      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['files'],
      });
      expect(mockCustomerRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedCustomer);
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when email already exists', async () => {
      const updateCustomerDto: UpdateCustomerDto = {
        email: 'existing@example.com',
      };

      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.save.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(
        service.update('test-id', updateCustomerDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a customer', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.remove.mockResolvedValue(undefined);

      await service.remove('test-id');

      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['files'],
      });
      expect(mockCustomerRepository.remove).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activate', () => {
    it('should activate a customer', async () => {
      const inactiveCustomer = { ...mockCustomer, active: false };
      const activatedCustomer = { ...mockCustomer, active: true };

      mockCustomerRepository.findOne.mockResolvedValue(inactiveCustomer);
      mockCustomerRepository.save.mockResolvedValue(activatedCustomer);

      const result = await service.activate('test-id');

      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['files'],
      });
      expect(mockCustomerRepository.save).toHaveBeenCalled();
      expect(result).toEqual(activatedCustomer);
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.activate('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate a customer', async () => {
      const deactivatedCustomer = { ...mockCustomer, active: false };

      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(deactivatedCustomer);

      const result = await service.deactivate('test-id');

      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['files'],
      });
      expect(mockCustomerRepository.save).toHaveBeenCalled();
      expect(result).toEqual(deactivatedCustomer);
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.deactivate('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadFile', () => {
    it('should upload a file for a customer', async () => {
      const mockFile = {
        originalname: 'original-file.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerFileRepository.create.mockReturnValue(mockCustomerFile);
      mockCustomerFileRepository.save.mockResolvedValue(mockCustomerFile);

      // Mock fs and path functions
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (path.join as jest.Mock).mockReturnValue(
        '/uploads/customers/test-id/test-file.pdf',
      );
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.uploadFile('test-id', mockFile);

      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['files'],
      });
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(mockCustomerFileRepository.create).toHaveBeenCalled();
      expect(mockCustomerFileRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCustomerFile);
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      const mockFile = {} as Express.Multer.File;
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(
        service.uploadFile('non-existent-id', mockFile),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file for a customer', async () => {
      mockCustomerFileRepository.findOne.mockResolvedValue(mockCustomerFile);
      mockCustomerFileRepository.remove.mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.deleteFile('test-id', 'file-id');

      expect(mockCustomerFileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-id', customerId: 'test-id' },
      });
      expect(fs.unlink).toHaveBeenCalled();
      expect(mockCustomerFileRepository.remove).toHaveBeenCalledWith(
        mockCustomerFile,
      );
    });

    it('should throw NotFoundException when file does not exist', async () => {
      mockCustomerFileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteFile('test-id', 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
