import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ProductModule } from './../src/product/product.module.js';

describe('Products (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /products devuelve el listado', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.total).toBe(8);
  });

  it('GET /products?category=combos&available=true filtra', async () => {
    const res = await request(app.getHttpServer())
      .get('/products?category=combos&available=true')
      .expect(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /products con categoría inválida responde 400', async () => {
    await request(app.getHttpServer())
      .get('/products?category=zzz')
      .expect(400);
  });

  it('GET /products/1 devuelve el producto', async () => {
    const res = await request(app.getHttpServer())
      .get('/products/1')
      .expect(200);
    expect(res.body.id).toBe(1);
  });

  it('GET /products/9999 responde 404', async () => {
    await request(app.getHttpServer()).get('/products/9999').expect(404);
  });
});
