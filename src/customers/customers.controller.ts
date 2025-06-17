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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/userRole';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomersDto } from './dto/filter-customers.dto';
import { CustomerResponse } from './types/customer.type';
import { CustomerFileResponse } from './types/customer-file.type';
import { Customer } from './entities/customer.entity';
import { CustomerFile } from './entities/customer-file.entity';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CustomerResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponse> {
    const customer: Customer =
      await this.customersService.create(createCustomerDto);
    return plainToClass(CustomerResponse, customer, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: HttpStatus.OK, type: [CustomerResponse] })
  @HttpCode(HttpStatus.OK)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(
    @Query() filterDto: FilterCustomersDto,
  ): Promise<{ items: CustomerResponse[]; total: number }> {
    const { items, total } = await this.customersService.findAll(filterDto);
    return {
      items: items.map((customer) =>
        plainToClass(CustomerResponse, customer, {
          excludeExtraneousValues: true,
        }),
      ),
      total,
    };
  }

  @ApiOperation({ summary: 'Get customer by id' })
  @ApiResponse({ status: HttpStatus.OK, type: CustomerResponse })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findOne(@Param('id') id: string): Promise<CustomerResponse> {
    const customer: Customer = await this.customersService.findOne(id);
    return plainToClass(CustomerResponse, customer, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: HttpStatus.OK, type: CustomerResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponse> {
    const customer: Customer = await this.customersService.update(
      id,
      updateCustomerDto,
    );
    return plainToClass(CustomerResponse, customer, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async remove(@Param('id') id: string): Promise<void> {
    return this.customersService.remove(id);
  }

  @ApiOperation({ summary: 'Activate customer' })
  @ApiResponse({ status: HttpStatus.OK, type: CustomerResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async activate(@Param('id') id: string): Promise<CustomerResponse> {
    const customer: Customer = await this.customersService.activate(id);
    return plainToClass(CustomerResponse, customer, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Deactivate customer' })
  @ApiResponse({ status: HttpStatus.OK, type: CustomerResponse })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deactivate(@Param('id') id: string): Promise<CustomerResponse> {
    const customer: Customer = await this.customersService.deactivate(id);
    return plainToClass(CustomerResponse, customer, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Upload file for customer' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: CustomerFileResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/files')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(pdf|doc|docx|jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<CustomerFileResponse> {
    const customerFile: CustomerFile = await this.customersService.uploadFile(
      id,
      file,
    );
    return plainToClass(CustomerFileResponse, customerFile, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Delete file for customer' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':customerId/files/:fileId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deleteFile(
    @Param('customerId') customerId: string,
    @Param('fileId') fileId: string,
  ): Promise<void> {
    return this.customersService.deleteFile(customerId, fileId);
  }
}
