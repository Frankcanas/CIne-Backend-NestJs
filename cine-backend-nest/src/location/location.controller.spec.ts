import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller.js';
import { LocationService } from './location.service.js';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [LocationService],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('debe obtener países con sus ciudades', async () => {
    const countries = await controller.getCountries();
    expect(countries.length).toBeGreaterThan(0);
    expect(countries[0].cities).toBeDefined();
  });

  it('debe obtener ciudades por countryId', async () => {
    const countries = await controller.getCountries();
    const cities = await controller.getCitiesByCountry(countries[0].id);
    expect(Array.isArray(cities)).toBe(true);
    expect(cities.length).toBeGreaterThan(0);
  });

  it('debe registrar la ubicación del usuario', async () => {
    const result = await controller.setUserLocation({
      userId: 1,
      city: 'Bogotá',
    });
    expect(result.success).toBe(true);
    expect(result.city).toBe('Bogotá');
  });
});
