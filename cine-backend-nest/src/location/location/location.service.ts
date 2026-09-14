import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Country, City, Location } from './entities/location.entity.js';
import {
  CreateCountryDto,
  CreateCityDto,
  SetUserLocationDto,
  CreateLocationDto,
} from './dto/create-location.dto.js';
import {
  UpdateCountryDto,
  UpdateCityDto,
  UpdateLocationDto,
} from './dto/update-location.dto.js';

@Injectable()
export class LocationService {
  private countries: Country[] = [];
  private cities: City[] = [];
  private countryIdCounter = 1;
  private cityIdCounter = 1;
  private userPreferredLocations = new Map<number, string>();

  constructor() {
    this.seedInitialData();
  }

  /**
   * Carga inicial de datos geográficos (Colombia y Panamá con sus ciudades)
   * replicando el comportamiento de seed-locations.ts de Express.
   */
  private seedInitialData(): void {
    const colombia = this.addCountryInternal('Colombia');
    const panama = this.addCountryInternal('Panamá');

    const colombiaCities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'];
    for (const cityName of colombiaCities) {
      this.addCityInternal(cityName, colombia.id);
    }

    const panamaCities = ['Ciudad de Panamá', 'David'];
    for (const cityName of panamaCities) {
      this.addCityInternal(cityName, panama.id);
    }
  }

  private addCountryInternal(name: string): Country {
    const country = new Country({
      id: this.countryIdCounter++,
      name,
      cities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.countries.push(country);
    return country;
  }

  private addCityInternal(name: string, countryId: number, isActive: boolean = true): City {
    const country = this.countries.find((c) => c.id === countryId);
    const city = new City({
      id: this.cityIdCounter++,
      name,
      countryId,
      isActive,
      country,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.cities.push(city);
    if (country) {
      country.cities.push(city);
    }

    return city;
  }

  // ==========================================
  // Métodos de Países (Country) y su relación con Ciudades
  // ==========================================

  /**
   * Obtiene todos los países con su lista de ciudades relacionadas.
   */
  async getCountries(): Promise<Country[]> {
    return [...this.countries].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtiene un país por ID incluyendo su relación de ciudades.
   */
  async findCountryById(id: number): Promise<Country> {
    const country = this.countries.find((c) => c.id === id);
    if (!country) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }
    return country;
  }

  /**
   * Crea un nuevo país y prepara su relación de ciudades.
   */
  async createCountry(dto: CreateCountryDto): Promise<Country> {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('El nombre del país es requerido');
    }

    const exists = this.countries.some(
      (c) => c.name.toLowerCase() === dto.name.trim().toLowerCase(),
    );
    if (exists) {
      throw new ConflictException(`El país "${dto.name}" ya existe`);
    }

    return this.addCountryInternal(dto.name.trim());
  }

  /**
   * Actualiza el país y sincroniza la relación en las ciudades dependientes.
   */
  async updateCountry(id: number, dto: UpdateCountryDto): Promise<Country> {
    const country = await this.findCountryById(id);

    if (dto.name && dto.name.trim() !== '') {
      const duplicate = this.countries.some(
        (c) => c.id !== id && c.name.toLowerCase() === dto.name!.trim().toLowerCase(),
      );
      if (duplicate) {
        throw new ConflictException(`Ya existe otro país con el nombre "${dto.name}"`);
      }
      country.name = dto.name.trim();
      country.updatedAt = new Date();

      // Sincronizar referencia en las ciudades relacionadas
      for (const city of country.cities) {
        if (city.country) {
          city.country.name = country.name;
        }
      }
    }

    return country;
  }

  /**
   * Elimina un país y sus ciudades asociadas en cascada.
   */
  async removeCountry(id: number): Promise<{ message: string }> {
    const countryIndex = this.countries.findIndex((c) => c.id === id);
    if (countryIndex === -1) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }

    const [removedCountry] = this.countries.splice(countryIndex, 1);
    // Eliminar ciudades asociadas a este país
    this.cities = this.cities.filter((city) => city.countryId !== id);

    return {
      message: `País "${removedCountry.name}" y sus ciudades asociadas fueron eliminados correctamente`,
    };
  }

  // ==========================================
  // Métodos de Ciudades (City) y su relación con País
  // ==========================================

  /**
   * Obtiene las ciudades pertenecientes a un país específico.
   * Migrado de Express: /api/locations/countries/:countryId/cities
   */
  async getCitiesByCountry(countryId: number, onlyActive: boolean = true): Promise<City[]> {
    const country = await this.findCountryById(countryId);

    return country.cities
      .filter((city) => (onlyActive ? city.isActive : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtiene todas las ciudades junto con su país relacionado.
   */
  async findAllCities(onlyActive: boolean = false): Promise<City[]> {
    return this.cities
      .filter((city) => (onlyActive ? city.isActive : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtiene una ciudad por ID con su relación al país.
   */
  async findCityById(id: number): Promise<City> {
    const city = this.cities.find((c) => c.id === id);
    if (!city) {
      throw new NotFoundException(`Ciudad con ID ${id} no encontrada`);
    }
    return city;
  }

  /**
   * Crea una ciudad y establece la relación bidireccional con el país.
   */
  async createCity(dto: CreateCityDto): Promise<City> {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('El nombre de la ciudad es requerido');
    }
    if (!dto.countryId) {
      throw new BadRequestException('El ID del país es requerido');
    }

    const country = await this.findCountryById(dto.countryId);

    const duplicate = country.cities.some(
      (c) => c.name.toLowerCase() === dto.name.trim().toLowerCase(),
    );
    if (duplicate) {
      throw new ConflictException(
        `La ciudad "${dto.name}" ya existe en el país "${country.name}"`,
      );
    }

    return this.addCityInternal(dto.name.trim(), country.id, dto.isActive ?? true);
  }

  /**
   * Actualiza una ciudad y actualiza la relación si cambia de país.
   */
  async updateCity(id: number, dto: UpdateCityDto): Promise<City> {
    const city = await this.findCityById(id);

    if (dto.name && dto.name.trim() !== '') {
      city.name = dto.name.trim();
    }

    if (dto.isActive !== undefined) {
      city.isActive = dto.isActive;
    }

    if (dto.countryId && dto.countryId !== city.countryId) {
      const newCountry = await this.findCountryById(dto.countryId);
      const oldCountry = this.countries.find((c) => c.id === city.countryId);

      // Remover del país anterior
      if (oldCountry) {
        oldCountry.cities = oldCountry.cities.filter((c) => c.id !== city.id);
      }

      // Asociar al nuevo país
      city.countryId = newCountry.id;
      city.country = newCountry;
      newCountry.cities.push(city);
    }

    city.updatedAt = new Date();
    return city;
  }

  /**
   * Elimina una ciudad y remueve la referencia en el país correspondiente.
   */
  async removeCity(id: number): Promise<{ message: string }> {
    const cityIndex = this.cities.findIndex((c) => c.id === id);
    if (cityIndex === -1) {
      throw new NotFoundException(`Ciudad con ID ${id} no encontrada`);
    }

    const [removedCity] = this.cities.splice(cityIndex, 1);
    const country = this.countries.find((c) => c.id === removedCity.countryId);
    if (country) {
      country.cities = country.cities.filter((c) => c.id !== removedCity.id);
    }

    return {
      message: `Ciudad "${removedCity.name}" eliminada correctamente`,
    };
  }

  // ==========================================
  // Establecer ubicación preferida del usuario (HU-002 Express)
  // ==========================================

  /**
   * Establece la ubicación preferida de un usuario.
   * Migrado de Express: POST /api/locations/users/location
   */
  async setUserLocation(
    dto: SetUserLocationDto,
  ): Promise<{ success: boolean; city: string; country?: string }> {
    if (!dto.userId || !dto.city) {
      throw new BadRequestException('userId y city son requeridos');
    }

    const city = this.cities.find(
      (c) => c.name.toLowerCase() === dto.city.trim().toLowerCase(),
    );

    this.userPreferredLocations.set(dto.userId, dto.city.trim());

    return {
      success: true,
      city: dto.city.trim(),
      country: city?.country?.name,
    };
  }

  // ==========================================
  // Métodos estándar del recurso Location
  // ==========================================

  async findAll(): Promise<Country[]> {
    return this.getCountries();
  }

  async findOne(id: number): Promise<Country> {
    return this.findCountryById(id);
  }

  async create(dto: CreateLocationDto): Promise<Location | Country | City> {
    if (dto.countryName && dto.cityName) {
      let country = this.countries.find(
        (c) => c.name.toLowerCase() === dto.countryName!.trim().toLowerCase(),
      );
      if (!country) {
        country = await this.createCountry({ name: dto.countryName });
      }
      const city = await this.createCity({
        name: dto.cityName,
        countryId: country.id,
      });

      return new Location({ country, city });
    }

    if (dto.countryName) {
      return this.createCountry({ name: dto.countryName });
    }

    if (dto.cityName && dto.countryId) {
      return this.createCity({
        name: dto.cityName,
        countryId: dto.countryId,
      });
    }

    throw new BadRequestException(
      'Debe proporcionar al menos countryName, o cityName con countryId',
    );
  }

  async update(id: number, dto: UpdateLocationDto): Promise<Country | City> {
    const country = this.countries.find((c) => c.id === id);
    if (country) {
      return this.updateCountry(id, { name: dto.countryName ?? dto.cityName });
    }

    const city = this.cities.find((c) => c.id === id);
    if (city) {
      return this.updateCity(id, {
        name: dto.cityName,
        countryId: dto.countryId,
        isActive: dto.isActive,
      });
    }

    throw new NotFoundException(`No se encontró ubicación con ID ${id}`);
  }

  async remove(id: number): Promise<{ message: string }> {
    const country = this.countries.find((c) => c.id === id);
    if (country) {
      return this.removeCountry(id);
    }

    const city = this.cities.find((c) => c.id === id);
    if (city) {
      return this.removeCity(id);
    }

    throw new NotFoundException(`No se encontró ubicación con ID ${id}`);
  }
}
