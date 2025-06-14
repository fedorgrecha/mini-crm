import { CommandFactory } from 'nest-commander';
import { CommandsModule } from './cli/commands.module';

async function bootstrap(): Promise<void> {
  console.log('=== CLI Bootstrap started ===');

  try {
    const factory = CommandFactory as {
      run: (module: any) => Promise<void>;
    };

    await factory.run(CommandsModule);
  } catch (error) {
    console.error('Error running command:', error);
    process.exit(1);
  }
}

bootstrap();
