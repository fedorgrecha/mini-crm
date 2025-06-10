import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.APP_PORT ?? 3000;
  const host = process.env.APP_HOST || '0.0.0.0';

  await app.listen(port, host);
}

bootstrap();
