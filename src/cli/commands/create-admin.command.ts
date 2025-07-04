import { Command, CommandRunner, Option } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/enums/userRole';

interface CreateAdminCommandOptions {
  name: string;
  email: string;
  password: string;
}

@Injectable()
@Command({ name: 'create-admin', description: 'Create a new admin user' })
export class CreateAdminCommand extends CommandRunner {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: CreateAdminCommandOptions,
  ): Promise<void> {
    try {
      if (!options?.name || !options?.email || !options?.password) {
        console.error('Name, email, and password are required');

        return;
      }

      const user = await this.usersService.create({
        name: options.name,
        email: options.email,
        password: options.password,
        role: UserRole.ADMIN,
        active: true,
      });

      console.log(`Admin user created successfully with ID: ${user.id}`);
    } catch (error) {
      console.error('Failed to create admin user:', error);
    }
  }

  @Option({
    flags: '-n, --name [name]',
    description: 'Admin name',
  })
  parseNameOption(value: string): string {
    return value;
  }

  @Option({
    flags: '-e, --email [email]',
    description: 'Admin email',
  })
  parseEmailOption(value: string): string {
    return value;
  }

  @Option({
    flags: '-p, --password [password]',
    description: 'Admin password',
  })
  parsePasswordOption(value: string): string {
    return value;
  }
}
