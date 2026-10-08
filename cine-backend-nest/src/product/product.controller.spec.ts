import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [ProductService],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('devuelve el listado paginado de productos', async () => {
    const result = await controller.findAll({ page: 1, limit: 5 });
    expect(result.data).toHaveLength(5);
    expect(result.meta.total).toBe(8);
  });

  it('devuelve un producto por ID', async () => {
    const product = await controller.findOne(2);
    expect(product.id).toBe(2);
  });

  it('propaga NotFoundException para un ID inexistente', async () => {
    await expect(controller.findOne(404)).rejects.toThrow(NotFoundException);
  });
});
