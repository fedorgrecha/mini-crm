import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomersDto } from './dto/filter-customers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('CustomersController', () => {
  let controller: CustomersController;

  const mockCustomer = {
    id: 'test-id',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '1234567890',
    active: true,
    files: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomerFile = {
    id: 'file-id',
    filename: 'test-file.pdf',
    originalname: 'original-file.pdf',
    mimetype: 'application/pdf',
    path: '/uploads/customers/test-id/test-file.pdf',
    size: 1024,
    customerId: 'test-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // CustomerFileResponse object without path
  const mockCustomerFileResponse = {
    id: 'file-id',
    filename: 'test-file.pdf',
    originalname: 'original-file.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    customerId: 'test-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  // Mock guards
  const mockJwtAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockRolesGuard = { canActivate: jest.fn().mockReturnValue(true) };

  // Mock plainToClass
  jest.mock('class-transformer', () => ({
    plainToClass: jest
      .fn()
      .mockImplementation((cls: any, plain: unknown) => plain),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call customersService.create with createCustomerDto', async () => {
      const createCustomerDto: CreateCustomerDto = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      };

      mockCustomersService.create.mockResolvedValue(mockCustomer);

      const result = await controller.create(createCustomerDto);

      expect(mockCustomersService.create).toHaveBeenCalledWith(
        createCustomerDto,
      );
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('findAll', () => {
    it('should call customersService.findAll with filterDto', async () => {
      const filterDto: FilterCustomersDto = {
        page: 1,
        limit: 10,
      };

      mockCustomersService.findAll.mockResolvedValue({
        items: [mockCustomer],
        total: 1,
      });

      const result = await controller.findAll(filterDto);

      expect(mockCustomersService.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual({
        items: [mockCustomer],
        total: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should call customersService.findOne with id', async () => {
      mockCustomersService.findOne.mockResolvedValue(mockCustomer);

      const result = await controller.findOne('test-id');

      expect(mockCustomersService.findOne).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('update', () => {
    it('should call customersService.update with id and updateCustomerDto', async () => {
      const updateCustomerDto: UpdateCustomerDto = {
        name: 'Updated Name',
      };

      const updatedCustomer = { ...mockCustomer, name: 'Updated Name' };
      mockCustomersService.update.mockResolvedValue(updatedCustomer);

      const result = await controller.update('test-id', updateCustomerDto);

      expect(mockCustomersService.update).toHaveBeenCalledWith(
        'test-id',
        updateCustomerDto,
      );
      expect(result).toEqual(updatedCustomer);
    });
  });

  describe('remove', () => {
    it('should call customersService.remove with id', async () => {
      mockCustomersService.remove.mockResolvedValue(undefined);

      await controller.remove('test-id');

      expect(mockCustomersService.remove).toHaveBeenCalledWith('test-id');
    });
  });

  describe('activate', () => {
    it('should call customersService.activate with id', async () => {
      const activatedCustomer = { ...mockCustomer, active: true };
      mockCustomersService.activate.mockResolvedValue(activatedCustomer);

      const result = await controller.activate('test-id');

      expect(mockCustomersService.activate).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(activatedCustomer);
    });
  });

  describe('deactivate', () => {
    it('should call customersService.deactivate with id', async () => {
      const deactivatedCustomer = { ...mockCustomer, active: false };
      mockCustomersService.deactivate.mockResolvedValue(deactivatedCustomer);

      const result = await controller.deactivate('test-id');

      expect(mockCustomersService.deactivate).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(deactivatedCustomer);
    });
  });

  describe('uploadFile', () => {
    it('should call customersService.uploadFile with id and file', async () => {
      const mockFile = {
        originalname: 'original-file.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      mockCustomersService.uploadFile.mockResolvedValue(mockCustomerFile);

      const result = await controller.uploadFile('test-id', mockFile);

      expect(mockCustomersService.uploadFile).toHaveBeenCalledWith(
        'test-id',
        mockFile,
      );
      expect(result).toEqual(mockCustomerFileResponse);
    });
  });

  describe('deleteFile', () => {
    it('should call customersService.deleteFile with customerId and fileId', async () => {
      mockCustomersService.deleteFile.mockResolvedValue(undefined);

      await controller.deleteFile('test-id', 'file-id');

      expect(mockCustomersService.deleteFile).toHaveBeenCalledWith(
        'test-id',
        'file-id',
      );
    });
  });
});
