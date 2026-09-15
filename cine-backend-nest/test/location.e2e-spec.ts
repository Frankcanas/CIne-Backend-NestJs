import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Locations (e2e)', () => {
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

  it('GET /api/locations/countries - debe retornar la lista de países', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/locations/countries')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    const names = response.body.map((c: any) => c.name);
    expect(names).toContain('Colombia');
    expect(names).toContain('Panamá');
  });

  it('GET /api/locations/countries/:countryId/cities - debe retornar ciudades del país', async () => {
    const countriesRes = await request(app.getHttpServer())
      .get('/api/locations/countries')
      .expect(200);

    const colombia = countriesRes.body.find((c: any) => c.name === 'Colombia');
    expect(colombia).toBeDefined();

    const response = await request(app.getHttpServer())
      .get(`/api/locations/countries/${colombia.id}/cities`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(5);
    const cityNames = response.body.map((c: any) => c.name);
    expect(cityNames).toContain('Bogotá');
    expect(cityNames).toContain('Medellín');
  });

  it('GET /api/locations/countries/:countryId/cities - 404 si el país no existe', async () => {
    await request(app.getHttpServer())
      .get('/api/locations/countries/99999/cities')
      .expect(404);
  });

  it('POST /api/locations/users/location - debe establecer ubicación del usuario', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/locations/users/location')
      .send({
        userId: 1,
        city: 'Medellín',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.city).toBe('Medellín');
    expect(response.body.country).toBe('Colombia');
  });

  it('POST /api/locations/users/location - debe retornar 400 si faltan campos requeridos', async () => {
    await request(app.getHttpServer())
      .post('/api/locations/users/location')
      .send({
        city: 'Medellín',
      })
      .expect(400);
  });
});
