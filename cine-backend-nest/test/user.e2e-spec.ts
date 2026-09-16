import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module.js';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/users - debe crear un usuario exitosamente', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Ana Martinez',
        email: 'ana@cine.com',
        phoneNumber: '3009998877',
        password: 'Password123!',
        city: 'Bogotá',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Ana Martinez');
    expect(res.body.email).toBe('ana@cine.com');
    expect(res.body.password).toBeUndefined();
    expect(res.body.membership?.name).toBe('Clásica');
  });

  it('POST /api/users - debe fallar si la contraseña no cumple la longitud o caracteres', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Ana Martinez',
        email: 'ana2@cine.com',
        phoneNumber: '3009998878',
        password: '123',
      })
      .expect(400);
  });

  it('GET /api/users - debe listar usuarios sanitizados', async () => {
    await request(app.getHttpServer()).post('/api/users').send({
      name: 'User E2E',
      email: 'e2e@cine.com',
      phoneNumber: '3001112233',
      password: 'Password123!',
    });

    const res = await request(app.getHttpServer()).get('/api/users').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].password).toBeUndefined();
  });

  it('GET /api/users/profile - debe retornar perfil con JWT Bearer', async () => {
    const created = await request(app.getHttpServer()).post('/api/users').send({
      name: 'Auth User',
      email: 'auth@cine.com',
      phoneNumber: '3004445566',
      password: 'Password123!',
    });

    const secret = process.env.JWT_SECRET || 'cine-secret-key-default';
    const token = jwt.sign({ userId: created.body.id, email: created.body.email }, secret);

    const res = await request(app.getHttpServer())
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(created.body.id);
    expect(res.body.name).toBe('Auth User');
    expect(res.body.membership.active).toBe(true);
    expect(res.body.membership.membershipName).toBe('Clásica');
  });

  it('GET /api/users/profile/:id - debe retornar perfil por ID público', async () => {
    const created = await request(app.getHttpServer()).post('/api/users').send({
      name: 'Public Profile User',
      email: 'public@cine.com',
      phoneNumber: '3007778899',
      password: 'Password123!',
    });

    const res = await request(app.getHttpServer())
      .get(`/api/users/profile/${created.body.id}`)
      .expect(200);

    expect(res.body.id).toBe(created.body.id);
    expect(res.body.name).toBe('Public Profile User');
  });
});
