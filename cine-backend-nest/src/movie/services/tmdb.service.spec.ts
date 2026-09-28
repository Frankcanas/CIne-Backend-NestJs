import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TmdbService } from './tmdb.service.js';

describe('TmdbService', () => {
  let service: TmdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              if (key === 'TMDB_BASE_URL') return 'https://api.themoviedb.org/3';
              if (key === 'TMDB_API_KEY') return 'test_api_key';
              if (key === 'TMDB_IMAGE_BASE_URL') return 'https://image.tmdb.org/t/p/w500';
              return '';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });
});
