import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product, ProductCategory } from './entities/product.entity.js';
import { ProductFilterDto } from './dto/product-filter.dto.js';

export interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class ProductService {
  private readonly products: Product[] = [];

  constructor() {
    this.seedInitialData();
  }

  /** Catálogo inicial de confitería del cine. */
  private seedInitialData(): void {
    const seed: Omit<Product, 'id'>[] = [
      {
        name: 'Combo Palomitas Grandes + Gaseosa',
        description: 'Palomitas grandes con mantequilla y gaseosa de 32 oz',
        category: ProductCategory.COMBOS,
        price: 24900,
        available: true,
      },
      {
        name: 'Combo Pareja',
        description: 'Palomitas grandes, 2 gaseosas medianas y 2 hot dogs',
        category: ProductCategory.COMBOS,
        price: 42900,
        available: true,
      },
      {
        name: 'Palomitas Medianas',
        description: 'Palomitas saladas tamaño mediano',
        category: ProductCategory.SNACKS,
        price: 12900,
        available: true,
      },
      {
        name: 'Nachos con Queso',
        description: 'Nachos crocantes con salsa de queso cheddar',
        category: ProductCategory.SNACKS,
        price: 14900,
        available: true,
      },
      {
        name: 'Hot Dog',
        description: 'Salchicha con pan, salsas y papa ripio',
        category: ProductCategory.SNACKS,
        price: 11900,
        available: false,
      },
      {
        name: 'Gaseosa Mediana',
        description: 'Gaseosa de 22 oz a elección',
        category: ProductCategory.BEBIDAS,
        price: 8900,
        available: true,
      },
      {
        name: 'Agua Embotellada',
        description: 'Agua sin gas de 600 ml',
        category: ProductCategory.BEBIDAS,
        price: 5500,
        available: true,
      },
      {
        name: 'Chocolatina',
        description: 'Chocolatina de leche de 50 g',
        category: ProductCategory.DULCES,
        price: 4500,
        available: true,
      },
    ];

    seed.forEach((item, index) => {
      this.products.push(new Product({ id: index + 1, ...item }));
    });
  }

  /** Lista productos con filtros opcionales y paginación. */
  async findAll(filter: ProductFilterDto = {}): Promise<PaginatedProducts> {
    const { search, category, available, minPrice, maxPrice } = filter;
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException('minPrice no puede ser mayor que maxPrice');
    }

    const term = search?.trim().toLowerCase();
    const filtered = this.products.filter(
      (product) =>
        (!term || product.name.toLowerCase().includes(term)) &&
        (!category || product.category === category) &&
        (available === undefined || product.available === available) &&
        (minPrice === undefined || product.price >= minPrice) &&
        (maxPrice === undefined || product.price <= maxPrice),
    );

    const total = filtered.length;
    const start = (page - 1) * limit;

    return {
      data: filtered.slice(start, start + limit),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Obtiene un producto por ID. */
  async findOne(id: number): Promise<Product> {
    const product = this.products.find((item) => item.id === id);
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }
}
