import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Express } from 'express';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthResponseDto } from '../src/auth/types/auth.types';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    // Clean up the database before tests
    await userRepository.clear();
  });

  afterAll(async () => {
    // Clean up the database after tests
    await userRepository.clear();
    await app.close();
  });

  describe('/api/v1/auth/signup (POST)', () => {
    it('should create a new user and return tokens', () => {
      return request(app.getHttpServer() as Express)
        .post('/api/v1/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should return 400 when email is already in use', () => {
      return request(app.getHttpServer() as Express)
        .post('/api/v1/auth/signup')
        .send({
          name: 'Another User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(409);
    });

    it('should return 400 when validation fails', () => {
      return request(app.getHttpServer() as Express)
        .post('/api/v1/auth/signup')
        .send({
          name: 'Test User',
          // Missing email
          password: 'password123',
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('should login and return tokens', () => {
      return request(app.getHttpServer() as Express)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should return 401 when credentials are invalid', () => {
      return request(app.getHttpServer() as Express)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password',
        })
        .expect(401);
    });
  });

  describe('/api/v1/auth/refresh (POST)', () => {
    const loginAndGetTokens = async (): Promise<AuthResponseDto> => {
      const response = await request(app.getHttpServer() as Express)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      return response.body as AuthResponseDto;
    };

    it('should refresh tokens', async () => {
      const { refreshToken } = await loginAndGetTokens();

      return request(app.getHttpServer() as Express)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should return 401 when refresh token is invalid', () => {
      return request(app.getHttpServer() as Express)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });
});
