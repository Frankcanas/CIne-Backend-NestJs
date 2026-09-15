import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service.js';
import {
  CreateLocationDto,
  CreateCountryDto,
  CreateCityDto,
  SetUserLocationDto,
} from './dto/create-location.dto.js';
import {
  UpdateLocationDto,
  UpdateCountryDto,
  UpdateCityDto,
} from './dto/update-location.dto.js';

@ApiTags('Locations')
@Controller(['locations', 'location'])
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // ==========================================
  // Endpoints migrados de Express: Países y Ciudades
  // ==========================================

  /**
   * Obtiene todos los países con sus ciudades relacionadas.
   * Migrado de Express: GET /api/locations/countries
   */
  @Get('countries')
  @ApiOperation({ summary: 'Obtener todos los países registrados' })
  @ApiResponse({ status: 200, description: 'Lista de países obtenida exitosamente' })
  getCountries() {
    return this.locationService.getCountries();
  }

  /**
   * Obtiene un país por ID con sus ciudades.
   */
  @Get('countries/:id')
  @ApiOperation({ summary: 'Obtener un país por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del país' })
  @ApiResponse({ status: 200, description: 'Detalles del país' })
  @ApiResponse({ status: 404, description: 'País no encontrado' })
  findCountryById(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findCountryById(id);
  }

  /**
   * Crea un nuevo país.
   */
  @Post('countries')
  @ApiOperation({ summary: 'Crear un nuevo país' })
  @ApiResponse({ status: 201, description: 'País creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El país ya existe' })
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationService.createCountry(createCountryDto);
  }

  /**
   * Actualiza un país.
   */
  @Patch('countries/:id')
  @ApiOperation({ summary: 'Actualizar información de un país' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del país' })
  @ApiResponse({ status: 200, description: 'País actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'País no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado' })
  updateCountry(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.locationService.updateCountry(id, updateCountryDto);
  }

  /**
   * Elimina un país y sus ciudades asociadas.
   */
  @Delete('countries/:id')
  @ApiOperation({ summary: 'Eliminar un país y sus ciudades asociadas' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del país' })
  @ApiResponse({ status: 200, description: 'País eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'País no encontrado' })
  removeCountry(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.removeCountry(id);
  }

  /**
   * Obtiene ciudades por país.
   * Migrado de Express: GET /api/locations/countries/:countryId/cities
   */
  @Get('countries/:countryId/cities')
  @ApiOperation({ summary: 'Obtener ciudades asociadas a un país' })
  @ApiParam({ name: 'countryId', type: Number, description: 'ID del país' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean, description: 'Filtrar solo ciudades activas' })
  @ApiResponse({ status: 200, description: 'Lista de ciudades obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'País no encontrado' })
  getCitiesByCountry(
    @Param('countryId', ParseIntPipe) countryId: number,
    @Query('onlyActive') onlyActive?: string,
  ) {
    const activeFilter = onlyActive !== undefined ? onlyActive === 'true' : true;
    return this.locationService.getCitiesByCountry(countryId, activeFilter);
  }

  /**
   * Obtiene todas las ciudades.
   */
  @Get('cities')
  @ApiOperation({ summary: 'Obtener todas las ciudades' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean, description: 'Filtrar solo ciudades activas' })
  @ApiResponse({ status: 200, description: 'Lista de todas las ciudades' })
  findAllCities(@Query('onlyActive') onlyActive?: string) {
    const activeFilter = onlyActive !== undefined ? onlyActive === 'true' : false;
    return this.locationService.findAllCities(activeFilter);
  }

  /**
   * Obtiene una ciudad por ID con su relación a país.
   */
  @Get('cities/:id')
  @ApiOperation({ summary: 'Obtener detalles de una ciudad por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ciudad' })
  @ApiResponse({ status: 200, description: 'Detalles de la ciudad' })
  @ApiResponse({ status: 404, description: 'Ciudad no encontrada' })
  findCityById(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findCityById(id);
  }

  /**
   * Crea una ciudad asignada a un país.
   */
  @Post('cities')
  @ApiOperation({ summary: 'Crear una nueva ciudad asignada a un país' })
  @ApiResponse({ status: 201, description: 'Ciudad creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'País no encontrado' })
  @ApiResponse({ status: 409, description: 'La ciudad ya existe en el país' })
  createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationService.createCity(createCityDto);
  }

  /**
   * Actualiza una ciudad.
   */
  @Patch('cities/:id')
  @ApiOperation({ summary: 'Actualizar información de una ciudad' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ciudad' })
  @ApiResponse({ status: 200, description: 'Ciudad actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ciudad o nuevo país no encontrado' })
  updateCity(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return this.locationService.updateCity(id, updateCityDto);
  }

  /**
   * Elimina una ciudad.
   */
  @Delete('cities/:id')
  @ApiOperation({ summary: 'Eliminar una ciudad por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ciudad' })
  @ApiResponse({ status: 200, description: 'Ciudad eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ciudad no encontrada' })
  removeCity(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.removeCity(id);
  }

  /**
   * Establece la ubicación preferida del usuario.
   * Migrado de Express: POST /api/locations/users/location
   */
  @Post('users/location')
  @ApiOperation({ summary: 'Establecer la ciudad y ubicación preferida de un usuario' })
  @ApiResponse({ status: 201, description: 'Ubicación de usuario establecida exitosamente' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  setUserLocation(@Body() setUserLocationDto: SetUserLocationDto) {
    return this.locationService.setUserLocation(setUserLocationDto);
  }

  // ==========================================
  // Endpoints base del recurso Location
  // ==========================================

  @Post()
  @ApiOperation({ summary: 'Crear ubicación (recurso genérico Location)' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las ubicaciones' })
  findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ubicación por ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ubicación por ID' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar ubicación por ID' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.remove(id);
  }
}
