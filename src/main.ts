import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation and strict mode
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Mini CRM')
    .setDescription('Mini CRM')
    .setVersion('1.0')
    .addTag('crm')
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.APP_PORT ?? 3000;
  const host = process.env.APP_HOST || '0.0.0.0';

  console.log(`Application is running on: http://${host}:${port}`);
  await app.listen(port, host);
}

bootstrap();
