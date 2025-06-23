import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
//import * as cookieParser from 'cookie-parser';
//import * as csurf from 'csurf';
import { NextFunction, Request, Response } from 'express';
import * as express from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Apply Helmet middleware for securing HTTP headers
  app.use(helmet());

  // Configure CORS with a whitelist
  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });

  // Create separate routers for different middleware stacks
  const webRouter = express.Router();
  const apiRouter = express.Router();

  // Have some troubles to set up CSRF for web routing
  // webRouter.use(cookieParser());
  // webRouter.use(
  //   csurf({
  //     cookie: {
  //       httpOnly: true,
  //       sameSite: 'strict',
  //       secure: process.env.NODE_ENV === 'production',
  //     },
  //   }),
  // );

  // API routes middleware (stateless)
  apiRouter.use((_req: Request, res: Response, next: NextFunction) => {
    // Ensure no cookies are set for API routes
    res.header('Cache-Control', 'no-store');

    next();
  });

  // Apply routers to specific paths
  app.use('/api', apiRouter);
  app.use('/graphql', apiRouter);
  app.use('/', webRouter);

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

  const port = process.env.APP_PORT ?? '3000';
  const host = process.env.APP_HOST || '0.0.0.0';

  console.log(`Application is running on: http://${host}:${port}`);
  await app.listen(port, host);
}

void bootstrap();
