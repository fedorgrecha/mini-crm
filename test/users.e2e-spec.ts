import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../src/users/enums/userRole';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let adminToken: string;
  let managerToken: string;
  let viewerToken: string;
  let userId: string;

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

    // Create admin user
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
      });

    adminToken = adminResponse.body.accessToken;

    // Set user role to ADMIN (since signup defaults to VIEWER)
    const adminUser = await userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (adminUser) {
      adminUser.role = UserRole.ADMIN;
      await userRepository.save(adminUser);
    }

    // Create manager user
    const managerResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Manager User',
        email: 'manager@example.com',
        password: 'password123',
      });

    managerToken = managerResponse.body.accessToken;

    // Set user role to MANAGER
    const managerUser = await userRepository.findOne({
      where: { email: 'manager@example.com' },
    });
    if (managerUser) {
      managerUser.role = UserRole.MANAGER;
      await userRepository.save(managerUser);
    }

    // Create viewer user
    const viewerResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Viewer User',
        email: 'viewer@example.com',
        password: 'password123',
      });

    viewerToken = viewerResponse.body.accessToken;

    // Login again to get fresh tokens with correct roles
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    adminToken = adminLoginResponse.body.accessToken;

    const managerLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'manager@example.com',
        password: 'password123',
      });

    managerToken = managerLoginResponse.body.accessToken;

    const viewerLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'viewer@example.com',
        password: 'password123',
      });

    viewerToken = viewerLoginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Clean up the database after tests
    await userRepository.clear();
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test User');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('password');

      userId = response.body.id;
    });

    it('should return 403 when authenticated as manager', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123',
        })
        .expect(403);
    });

    it('should return 403 when authenticated as viewer', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123',
        })
        .expect(403);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return all users when authenticated as manager', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return all users when authenticated as viewer', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a user when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
    });

    it('should return a user when authenticated as manager', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
    });

    it('should return a user when authenticated as viewer', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer()).get(`/users/${userId}`).expect(401);
    });

    it('should return 404 when user does not exist', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe('Updated Name');
    });

    it('should update a user when authenticated as manager', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Manager Updated Name',
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe('Manager Updated Name');
    });

    it('should return 403 when authenticated as viewer', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Viewer Updated Name',
        })
        .expect(403);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({
          name: 'Unauthenticated Updated Name',
        })
        .expect(401);
    });
  });

  describe('/users/:id/role (PATCH)', () => {
    it('should set user role when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: UserRole.MANAGER,
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
      expect(response.body.role).toBe(UserRole.MANAGER);
    });

    it('should return 403 when authenticated as manager', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/role`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          role: UserRole.ADMIN,
        })
        .expect(403);
    });

    it('should return 403 when authenticated as viewer', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/role`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          role: UserRole.ADMIN,
        })
        .expect(403);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/role`)
        .send({
          role: UserRole.ADMIN,
        })
        .expect(401);
    });
  });

  describe('/users/:id/activate and /users/:id/deactivate (PATCH)', () => {
    it('should deactivate a user when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
      expect(response.body.active).toBe(false);
    });

    it('should activate a user when authenticated as manager', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}/activate`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
      expect(response.body.active).toBe(true);
    });

    it('should return 403 when authenticated as viewer', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/deactivate`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/activate`)
        .expect(401);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should return 403 when authenticated as manager', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 when authenticated as viewer', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(401);
    });

    it('should delete a user when authenticated as admin', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should return 404 when trying to get deleted user', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
