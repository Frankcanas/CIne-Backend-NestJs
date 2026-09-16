import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserProfileDto } from './dto/user-profile.dto.js';
import { VerifyTokenDto } from './dto/verify-token.dto.js';
import { AuthGuard } from './guards/auth.guard.js';
import { CurrentUserId } from './decorators/current-user.decorator.js';

@ApiTags('Users')
@Controller(['users', 'user'])
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Crea un nuevo usuario.
   * Migrado de Express: POST /api/users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente (sin hash de contraseña)',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, email duplicado o contraseña no cumple políticas',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * Obtiene todos los usuarios registrados.
   * Migrado de Express: GET /api/users
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios registrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios sanitizados obtenida exitosamente',
  })
  async findAll() {
    return this.userService.findAll();
  }

  /**
   * Obtiene el perfil del usuario autenticado vía JWT Bearer.
   * Migrado de Express: GET /api/users/profile
   */
  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil y estado de membresía del usuario obtenido exitosamente',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Token no proporcionado o inválido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getAuthenticatedProfile(@CurrentUserId() userId?: number) {
    if (!userId) {
      throw new BadRequestException('userId no proporcionado');
    }
    return this.userService.getProfile(userId);
  }

  /**
   * Actualiza el perfil del usuario autenticado vía JWT Bearer.
   * Migrado de Express: PUT /api/users/profile
   */
  @Put('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado correctamente',
  })
  @ApiResponse({ status: 401, description: 'Token no proporcionado o inválido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateAuthenticatedProfile(
    @CurrentUserId() userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!userId) {
      throw new BadRequestException('userId no proporcionado');
    }
    const user = await this.userService.updateProfile(userId, updateUserDto);
    return {
      message: 'Perfil actualizado correctamente',
      user,
    };
  }

  /**
   * Valida un código de verificación de 6 dígitos para activar la cuenta de un usuario.
   * Migrado de Express: POST /api/token/verify (HU-006)
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar token de verificación y activar cuenta de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la validación del código de activación',
  })
  async verifyAccount(@Body() dto: VerifyTokenDto) {
    return this.userService.verifyToken(dto.userId, dto.token);
  }

  /**
   * Obtiene el perfil de un usuario por su ID.
   * Migrado de Express: GET /api/users/profile/:id
   */
  @Get('profile/:id')
  @ApiOperation({ summary: 'Obtener el perfil de un usuario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getProfileById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getProfile(id);
  }

  /**
   * Actualiza el perfil de un usuario por su ID.
   * Migrado de Express: PUT /api/users/profile/:id
   */
  @Put('profile/:id')
  @ApiOperation({ summary: 'Actualizar perfil de un usuario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateProfileById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateProfile(id, updateUserDto);
    return {
      message: 'Perfil actualizado correctamente',
      user,
    };
  }

  /**
   * Obtiene un usuario específico por su ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findSanitizedById(id);
  }

  /**
   * Elimina un usuario por su ID.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
