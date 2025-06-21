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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './enums/userRole';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UserResponse } from './types/user.type';
import { plainToClass } from 'class-transformer';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponse] })
  @HttpCode(HttpStatus.OK)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(
    @Query() filterDto: FilterUsersDto,
  ): Promise<{ items: UserResponse[]; total: number }> {
    const { items, total } = await this.usersService.findAll(filterDto);
    return {
      items: items.map((user) =>
        plainToClass(UserResponse, user, {
          excludeExtraneousValues: true,
        }),
      ),
      total,
    };
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    const user: User = await this.usersService.create(createUserDto);

    return plainToClass(UserResponse, user, { excludeExtraneousValues: true });
  }

  @ApiOperation({ summary: 'Find user by id' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    const user: User = await this.usersService.findOne(id);

    return plainToClass(UserResponse, user, { excludeExtraneousValues: true });
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user: User = await this.usersService.update(id, updateUserDto);

    return plainToClass(UserResponse, user, { excludeExtraneousValues: true });
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  async setRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ): Promise<UserResponse> {
    const user: User = await this.usersService.setRole(id, role);

    return plainToClass(UserResponse, user, { excludeExtraneousValues: true });
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async activate(@Param('id') id: string): Promise<UserResponse> {
    const user: User = await this.usersService.activate(id);

    return plainToClass(UserResponse, user, { excludeExtraneousValues: true });
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deactivate(@Param('id') id: string): Promise<UserResponse> {
    const user: User = await this.usersService.deactivate(id);

    return plainToClass(UserResponse, user, { excludeExtraneousValues: true });
  }
}
