import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service.js';
import { ProductFilterDto } from './dto/product-filter.dto.js';

@ApiTags('Products')
@Controller(['products', 'product'])
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /** US-200: consultar el catálogo de productos (confitería). */
  @Get()
  @ApiOperation({
    summary: 'Consultar productos',
    description:
      'Devuelve el catálogo de productos con filtros opcionales (nombre, categoría, disponibilidad, rango de precio) y paginación.',
  })
  @ApiResponse({ status: 200, description: 'Listado paginado de productos' })
  @ApiResponse({ status: 400, description: 'Parámetros de consulta inválidos' })
  findAll(@Query() filter: ProductFilterDto) {
    return this.productService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un producto por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Detalle del producto' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }
}
