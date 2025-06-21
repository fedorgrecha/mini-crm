import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerFile } from './entities/customer-file.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomersDto } from './dto/filter-customers.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { isDuplicateEntryError } from '../mysql.utilities';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(CustomerFile)
    private customerFilesRepository: Repository<CustomerFile>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      const customer = this.customersRepository.create(createCustomerDto);
      return await this.customersRepository.save(customer);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new BadRequestException(
          'Customer with this email already exists',
        );
      }

      throw error;
    }
  }

  async findAll(
    filterDto: FilterCustomersDto,
  ): Promise<{ items: Customer[]; total: number }> {
    const { id, email, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Customer> = {};

    if (id) {
      where.id = id;
    }

    if (email) {
      where.email = Like(`%${email}%`);
    }

    const [items, total] = await this.customersRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['files'],
    });

    return { items, total };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
      relations: ['files'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    try {
      Object.assign(customer, updateCustomerDto);

      return await this.customersRepository.save(customer);
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        throw new BadRequestException(
          'Customer with this email already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);

    // Delete all files from storage
    if (customer.files && customer.files.length > 0) {
      for (const file of customer.files) {
        try {
          await unlink(file.path);
        } catch (error) {
          console.error(`Failed to delete file ${file.path}:`, error);
        }
      }
    }

    await this.customersRepository.remove(customer);
  }

  async activate(id: string): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.active = true;
    return await this.customersRepository.save(customer);
  }

  async deactivate(id: string): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.active = false;
    return await this.customersRepository.save(customer);
  }

  async uploadFile(
    customerId: string,
    file: Express.Multer.File,
  ): Promise<CustomerFile> {
    const customer = await this.findOne(customerId);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(
      process.cwd(),
      'uploads',
      'customers',
      customerId,
    );
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to disk
    await writeFile(filePath, file.buffer);

    // Create file record in database
    const customerFile = this.customerFilesRepository.create({
      filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      path: filePath,
      size: file.size,
      customer,
      customerId: customer.id,
    });

    return await this.customerFilesRepository.save(customerFile);
  }

  async deleteFile(customerId: string, fileId: string): Promise<void> {
    const file = await this.customerFilesRepository.findOne({
      where: { id: fileId, customerId },
    });

    if (!file) {
      throw new NotFoundException(
        `File with ID ${fileId} not found for customer ${customerId}`,
      );
    }

    try {
      await unlink(file.path);
    } catch (error) {
      console.error(`Failed to delete file ${file.path}:`, error);
    }

    await this.customerFilesRepository.remove(file);
  }
}
