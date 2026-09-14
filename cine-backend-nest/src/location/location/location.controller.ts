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

@Controller('location')
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
  getCountries() {
    return this.locationService.getCountries();
  }

  /**
   * Obtiene un país por ID con sus ciudades.
   */
  @Get('countries/:id')
  findCountryById(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findCountryById(id);
  }

  /**
   * Crea un nuevo país.
   */
  @Post('countries')
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationService.createCountry(createCountryDto);
  }

  /**
   * Actualiza un país.
   */
  @Patch('countries/:id')
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
  removeCountry(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.removeCountry(id);
  }

  /**
   * Obtiene ciudades por país.
   * Migrado de Express: GET /api/locations/countries/:countryId/cities
   */
  @Get('countries/:countryId/cities')
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
  findAllCities(@Query('onlyActive') onlyActive?: string) {
    const activeFilter = onlyActive !== undefined ? onlyActive === 'true' : false;
    return this.locationService.findAllCities(activeFilter);
  }

  /**
   * Obtiene una ciudad por ID con su relación a país.
   */
  @Get('cities/:id')
  findCityById(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findCityById(id);
  }

  /**
   * Crea una ciudad asignada a un país.
   */
  @Post('cities')
  createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationService.createCity(createCityDto);
  }

  /**
   * Actualiza una ciudad.
   */
  @Patch('cities/:id')
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
  removeCity(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.removeCity(id);
  }

  /**
   * Establece la ubicación preferida del usuario.
   * Migrado de Express: POST /api/locations/users/location
   */
  @Post('users/location')
  setUserLocation(@Body() setUserLocationDto: SetUserLocationDto) {
    return this.locationService.setUserLocation(setUserLocationDto);
  }

  // ==========================================
  // Endpoints base del recurso Location
  // ==========================================

  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.remove(id);
  }
}
