import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/userRole';
import { FilterUsersDto } from './dto/filter-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(input: RegisterUserDto): Promise<User> {
    // Check if a user with this email already exists
    const existingUser: User | null = await this.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user: User = this.usersRepository.create(input);

    return this.usersRepository.save(user);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(
    filterDto: FilterUsersDto,
  ): Promise<{ items: User[]; total: number }> {
    const { id, email, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<User> = {};

    if (id) {
      where.id = id;
    }

    if (email) {
      where.email = Like(`%${email}%`);
    }

    const [items, total] = await this.usersRepository.findAndCount({
      where,
      skip,
      take: limit,
    });

    return { items, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Update user properties
    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  async setRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    return this.usersRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.active = true;
    return this.usersRepository.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.active = false;
    return this.usersRepository.save(user);
  }
}
