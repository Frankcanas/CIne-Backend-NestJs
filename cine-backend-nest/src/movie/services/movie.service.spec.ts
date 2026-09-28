import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service.js';
import { TmdbService } from './tmdb.service.js';

describe('MovieService', () => {
  let service: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: TmdbService,
          useValue: {
            getPopularMovies: vi.fn().mockResolvedValue([]),
            getMovieDetails: vi.fn().mockResolvedValue({
              tmdbId: 100,
              title: 'Movie Test',
              originalTitle: 'Movie Test',
              synopsis: 'Test overview',
              posterUrl: null,
              backdropUrl: null,
              releaseDate: '2026-01-01',
              rating: 7.5,
              voteCount: 100,
            }),
            getGenres: vi.fn().mockResolvedValue([{ id: 28, name: 'Acción' }]),
            getMovieRecommendations: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe crear y listar películas locales', async () => {
    const movie = await service.createMovie({
      title: 'Matrix',
      synopsis: 'Pastilla roja o azul',
      rating: 8.7,
    });

    expect(movie.id).toBeDefined();
    expect(movie.title).toBe('Matrix');

    const all = await service.getMovies();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it('debe sincronizar película con TMDB', async () => {
    const synced = await service.syncWithTmdb(100);
    expect(synced.tmdbId).toBe(100);
    expect(synced.title).toBe('Movie Test');
  });
});
