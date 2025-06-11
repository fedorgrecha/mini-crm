import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/userRole';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    role: UserRole.VIEWER,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setRole: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
  };

  // Mock guards
  const mockJwtAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockRolesGuard = { canActivate: jest.fn().mockReturnValue(true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.create with createUserDto', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should call usersService.findAll', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne with id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('test-id');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should call usersService.update with id and updateUserDto', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('test-id', updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        'test-id',
        updateUserDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should call usersService.remove with id', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('test-id');

      expect(mockUsersService.remove).toHaveBeenCalledWith('test-id');
    });
  });

  describe('setRole', () => {
    it('should call usersService.setRole with id and role', async () => {
      const updatedUser = { ...mockUser, role: UserRole.ADMIN };
      mockUsersService.setRole.mockResolvedValue(updatedUser);

      const result = await controller.setRole('test-id', UserRole.ADMIN);

      expect(mockUsersService.setRole).toHaveBeenCalledWith(
        'test-id',
        UserRole.ADMIN,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('activate', () => {
    it('should call usersService.activate with id', async () => {
      const activatedUser = { ...mockUser, active: true };
      mockUsersService.activate.mockResolvedValue(activatedUser);

      const result = await controller.activate('test-id');

      expect(mockUsersService.activate).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(activatedUser);
    });
  });

  describe('deactivate', () => {
    it('should call usersService.deactivate with id', async () => {
      const deactivatedUser = { ...mockUser, active: false };
      mockUsersService.deactivate.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivate('test-id');

      expect(mockUsersService.deactivate).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(deactivatedUser);
    });
  });
});
