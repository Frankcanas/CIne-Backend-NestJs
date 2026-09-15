import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service.js';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationService],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Relación Country y City', () => {
    it('debe inicializar países sembrados con sus respectivas ciudades relacionadas', async () => {
      const countries = await service.getCountries();
      expect(countries.length).toBeGreaterThanOrEqual(2);

      const colombia = countries.find((c) => c.name === 'Colombia');
      expect(colombia).toBeDefined();
      expect(colombia?.cities.length).toBe(5);
      expect(colombia?.cities.map((c) => c.name)).toContain('Bogotá');
      expect(colombia?.cities.map((c) => c.name)).toContain('Medellín');

      // Comprobar relación inversa de la ciudad hacia el país
      const bogota = colombia?.cities.find((c) => c.name === 'Bogotá');
      expect(bogota?.country?.name).toBe('Colombia');
      expect(bogota?.countryId).toBe(colombia?.id);
    });

    it('debe obtener ciudades filtradas por país con getCitiesByCountry', async () => {
      const countries = await service.getCountries();
      const panama = countries.find((c) => c.name === 'Panamá')!;

      const panamaCities = await service.getCitiesByCountry(panama.id);
      expect(panamaCities.length).toBe(2);
      expect(panamaCities.map((c) => c.name)).toEqual(['Ciudad de Panamá', 'David']);
    });

    it('debe lanzar NotFoundException si el país no existe al consultar sus ciudades', async () => {
      await expect(service.getCitiesByCountry(9999)).rejects.toThrow(NotFoundException);
    });

    it('debe crear un nuevo país y permitir asociarle ciudades manteniendo la relación', async () => {
      const nuevoPais = await service.createCountry({ name: 'México' });
      expect(nuevoPais.id).toBeDefined();
      expect(nuevoPais.name).toBe('México');
      expect(nuevoPais.cities).toEqual([]);

      const nuevaCiudad = await service.createCity({
        name: 'Guadalajara',
        countryId: nuevoPais.id,
      });

      expect(nuevaCiudad.countryId).toBe(nuevoPais.id);
      expect(nuevaCiudad.country?.name).toBe('México');

      // Validar que el país ahora contiene la ciudad en su relación
      const paisActualizado = await service.findCountryById(nuevoPais.id);
      expect(paisActualizado.cities.map((c) => c.name)).toContain('Guadalajara');
    });

    it('debe lanzar ConflictException si se intenta crear un país con nombre duplicado', async () => {
      await expect(service.createCountry({ name: 'Colombia' })).rejects.toThrow(ConflictException);
    });

    it('debe permitir mover una ciudad a otro país y actualizar las relaciones en ambos lados', async () => {
      const countries = await service.getCountries();
      const colombia = countries.find((c) => c.name === 'Colombia')!;
      const panama = countries.find((c) => c.name === 'Panamá')!;

      const ciudad = await service.createCity({
        name: 'Frontera',
        countryId: colombia.id,
      });

      expect(ciudad.countryId).toBe(colombia.id);

      // Cambiar ciudad al país Panamá
      const ciudadActualizada = await service.updateCity(ciudad.id, {
        countryId: panama.id,
      });

      expect(ciudadActualizada.countryId).toBe(panama.id);
      expect(ciudadActualizada.country?.name).toBe('Panamá');

      const colActualizado = await service.findCountryById(colombia.id);
      expect(colActualizado.cities.some((c) => c.id === ciudad.id)).toBe(false);

      const panActualizado = await service.findCountryById(panama.id);
      expect(panActualizado.cities.some((c) => c.id === ciudad.id)).toBe(true);
    });

    it('debe eliminar la ciudad de la relación del país cuando se invoca removeCity', async () => {
      const countries = await service.getCountries();
      const colombia = countries.find((c) => c.name === 'Colombia')!;

      const ciudad = await service.createCity({
        name: 'CiudadTemporal',
        countryId: colombia.id,
      });

      await service.removeCity(ciudad.id);

      const colActualizado = await service.findCountryById(colombia.id);
      expect(colActualizado.cities.some((c) => c.id === ciudad.id)).toBe(false);
    });
  });

  describe('setUserLocation (Migrado de Express)', () => {
    it('debe guardar y responder con la ubicación del usuario', async () => {
      const res = await service.setUserLocation({
        userId: 42,
        city: 'Medellín',
      });

      expect(res.success).toBe(true);
      expect(res.city).toBe('Medellín');
      expect(res.country).toBe('Colombia');
    });
  });
});
