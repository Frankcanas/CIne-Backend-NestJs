import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller.js';
import { TmdbService } from './services/tmdb.service.js';
import { MovieService } from './services/movie.service.js';

describe('MovieController', () => {
  let controller: MovieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: TmdbService,
          useValue: {
            getPopularMovies: vi.fn().mockResolvedValue([]),
            getNowPlayingMovies: vi.fn().mockResolvedValue([]),
            getUpcomingMovies: vi.fn().mockResolvedValue([]),
            getTopRatedMovies: vi.fn().mockResolvedValue([]),
            searchMovies: vi.fn().mockResolvedValue([]),
            getGenres: vi.fn().mockResolvedValue([]),
            getMovieDetails: vi.fn().mockResolvedValue({}),
            getMovieRecommendations: vi.fn().mockResolvedValue([]),
          },
        },
        {
          provide: MovieService,
          useValue: {
            getMovies: vi.fn().mockResolvedValue([]),
            findById: vi.fn().mockResolvedValue({}),
            createMovie: vi.fn().mockResolvedValue({}),
            updateMovie: vi.fn().mockResolvedValue({}),
            deleteMovie: vi.fn().mockResolvedValue({ message: 'Deleted' }),
            syncWithTmdb: vi.fn().mockResolvedValue({}),
            syncGenresFromTmdb: vi.fn().mockResolvedValue([]),
            getMovieRecommendations: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });
});
