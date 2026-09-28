import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service.js';
import { CreateMembershipDto } from './dto/create-membership.dto.js';
import { Membership } from './entities/membership.entity.js';

@ApiTags('Membership')
@Controller(['membership', 'memberships'])
export class MembershipController {
  constructor(private readonly userService: UserService) {}

  /**
   * Crea una nueva membresía.
   * Migrado de Express: POST /api/membership/create
   */
  @Post(['create', ''])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crea una nueva membresía' })
  @ApiResponse({
    status: 201,
    description: 'Membresía creada exitosamente',
    type: Membership,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 500, description: 'Error en el servidor' })
  async create(@Body() createMembershipDto: CreateMembershipDto) {
    return this.userService.createMembership(createMembershipDto);
  }

  /**
   * Obtener el catálogo de beneficios y descuentos por membresía.
   * Migrado de Express: GET /api/membership/benefits
   */
  @Get('benefits')
  @ApiOperation({
    summary: 'Obtener el catálogo de beneficios y descuentos por membresía',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de beneficios de membresías',
  })
  async getBenefits() {
    return this.userService.getBenefitsCatalog();
  }

  /**
   * Obtiene la lista de todas las membresías.
   * Migrado de Express: GET /api/membership
   */
  @Get()
  @ApiOperation({ summary: 'Obtiene la lista de todas las membresías' })
  @ApiResponse({
    status: 200,
    description: 'Lista de membresías obtenida exitosamente',
    type: [Membership],
  })
  async getAll() {
    return this.userService.getAllMemberships();
  }
}
