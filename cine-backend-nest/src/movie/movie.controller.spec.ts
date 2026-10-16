import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller.js';
import { TmdbService } from './services/tmdb.service.js';
import { MovieService } from './services/movie.service.js';
import { BillboardFilterDto } from './dto/billboard-filter.dto.js';
import { BillboardResponse } from './types/billboard.types.js';

describe('MovieController', () => {
  let controller: MovieController;
  let movieService: MovieService;

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
            getWeeklyBillboard: vi.fn(),
            getTodayBillboard: vi.fn(),
            getFilteredBillboard: vi.fn(),
            getMovieFunctions: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    movieService = module.get<MovieService>(MovieService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('detalle (HU-004)', () => {
    it('GET :id llama findById y retorna su respuesta', async () => {
      const detail = { id: 1, availableFormats: ['2D'] };
      vi.mocked(movieService.findById).mockResolvedValue(detail as never);

      await expect(controller.getMovieById(1)).resolves.toBe(detail);
      expect(movieService.findById).toHaveBeenCalledWith(1);
    });

    it('GET :id/functions pasa id y city al service', async () => {
      const functions = [{ id: 1, soldOut: false }];
      vi.mocked(movieService.getMovieFunctions).mockResolvedValue(
        functions as never,
      );

      await expect(
        controller.getMovieFunctions(1, { city: 'Barranquilla' }),
      ).resolves.toBe(functions);
      expect(movieService.getMovieFunctions).toHaveBeenCalledWith(
        1,
        'Barranquilla',
      );
    });

    it('GET :id/recommendations llama al service', async () => {
      await controller.getMovieRecommendations(1);

      expect(movieService.getMovieRecommendations).toHaveBeenCalledWith(1);
    });
  });

  describe('cartelera', () => {
    const buildResponse = (
      period: BillboardResponse['period'],
    ): BillboardResponse => ({
      period,
      from: '2026-10-15T20:30:00.000Z',
      to: '2026-10-22T20:30:00.000Z',
      totalMovies: 0,
      message:
        'No existen funciones activas ni películas en cartelera para los filtros seleccionados.',
      movies: [],
    });

    it('weekly pasa el filtro al service y retorna su respuesta', async () => {
      const filter: BillboardFilterDto = { city: 'Medellín', available: true };
      const response = buildResponse('weekly');
      vi.mocked(movieService.getWeeklyBillboard).mockResolvedValue(response);

      await expect(controller.getWeeklyBillboard(filter)).resolves.toBe(
        response,
      );
      expect(movieService.getWeeklyBillboard).toHaveBeenCalledWith(filter);
    });

    it('today pasa el filtro al service y retorna su respuesta', async () => {
      const filter: BillboardFilterDto = { format: '3D' };
      const response = buildResponse('today');
      vi.mocked(movieService.getTodayBillboard).mockResolvedValue(response);

      await expect(controller.getTodayBillboard(filter)).resolves.toBe(
        response,
      );
      expect(movieService.getTodayBillboard).toHaveBeenCalledWith(filter);
    });

    it('filter pasa el filtro al service y retorna su respuesta', async () => {
      const filter: BillboardFilterDto = { date: '2026-10-20', genreId: 3 };
      const response = buildResponse('filtered');
      vi.mocked(movieService.getFilteredBillboard).mockResolvedValue(response);

      await expect(controller.getFilteredBillboard(filter)).resolves.toBe(
        response,
      );
      expect(movieService.getFilteredBillboard).toHaveBeenCalledWith(filter);
    });
  });
});
