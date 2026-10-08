import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { ProductCategory } from './entities/product.entity.js';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('lista los productos con paginación por defecto', async () => {
    const result = await service.findAll();
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.meta).toMatchObject({ page: 1, limit: 10 });
    expect(result.meta.total).toBe(8);
    expect(result.meta.totalPages).toBe(1);
  });

  it('pagina los resultados', async () => {
    const result = await service.findAll({ page: 2, limit: 3 });
    expect(result.data).toHaveLength(3);
    expect(result.data[0].id).toBe(4);
    expect(result.meta.totalPages).toBe(3);
  });

  it('filtra por categoría', async () => {
    const result = await service.findAll({ category: ProductCategory.COMBOS });
    expect(result.data.length).toBe(2);
    expect(
      result.data.every((p) => p.category === ProductCategory.COMBOS),
    ).toBe(true);
  });

  it('filtra por nombre sin distinguir mayúsculas', async () => {
    const result = await service.findAll({ search: 'PALOMITAS' });
    expect(result.data.length).toBe(2);
  });

  it('filtra por disponibilidad', async () => {
    const result = await service.findAll({ available: false });
    expect(result.data.map((p) => p.name)).toEqual(['Hot Dog']);
  });

  it('filtra por rango de precio', async () => {
    const result = await service.findAll({ minPrice: 5000, maxPrice: 9000 });
    expect(result.data.every((p) => p.price >= 5000 && p.price <= 9000)).toBe(
      true,
    );
    expect(result.data.length).toBe(2);
  });

  it('rechaza un rango de precio inválido', async () => {
    await expect(
      service.findAll({ minPrice: 100, maxPrice: 10 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('devuelve lista vacía cuando nada coincide', async () => {
    const result = await service.findAll({ search: 'inexistente' });
    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });

  it('obtiene un producto por ID', async () => {
    const product = await service.findOne(1);
    expect(product.name).toContain('Combo');
  });

  it('lanza NotFoundException si el producto no existe', async () => {
    await expect(service.findOne(9999)).rejects.toThrow(NotFoundException);
  });
});
