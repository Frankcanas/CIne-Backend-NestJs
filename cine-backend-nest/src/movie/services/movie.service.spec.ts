import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Movie } from '../entities/movie.entity.js';
import { Showtime } from '../entities/showtime.entity.js';
import { MovieRepository } from '../repositories/movie.repository.js';
import { MovieService } from './movie.service.js';
import { TmdbService } from './tmdb.service.js';

const buildMovie = (showtimes: Partial<Showtime>[]): Movie =>
  new Movie({ id: 1, title: 'Matrix', showtimes: showtimes as Showtime[] });

describe('MovieService', () => {
  let service: MovieService;
  let tmdbService: TmdbService;
  let movieRepository: {
    findBillboard: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findFunctionsByMovieId: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    movieRepository = {
      findBillboard: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null),
      findFunctionsByMovieId: vi.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: MovieRepository, useValue: movieRepository },
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
    tmdbService = module.get<TmdbService>(TmdbService);
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

  it('updateMovie sigue actualizando el almacenamiento en memoria', async () => {
    const movie = await service.createMovie({ title: 'Matrix' });

    const updated = await service.updateMovie(movie.id, { title: 'Matrix 2' });

    expect(updated.title).toBe('Matrix 2');
    expect(movieRepository.findById).not.toHaveBeenCalled();
  });

  describe('detalle (HU-004)', () => {
    const persisted = new Movie({
      id: 1,
      tmdbId: 603,
      title: 'Película Billboard Test',
      trailerUrl: 'https://www.youtube.com/watch?v=abc',
    });

    it('findById obtiene la película desde MovieRepository', async () => {
      movieRepository.findById.mockResolvedValue(persisted);

      const detail = await service.findById(1);

      expect(movieRepository.findById).toHaveBeenCalledWith(1);
      expect(movieRepository.findFunctionsByMovieId).toHaveBeenCalledWith(1);
      expect(detail).toMatchObject({
        id: 1,
        title: 'Película Billboard Test',
        trailerUrl: 'https://www.youtube.com/watch?v=abc',
      });
    });

    it('findById de película inexistente lanza NotFoundException', async () => {
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(movieRepository.findFunctionsByMovieId).not.toHaveBeenCalled();
    });

    it('detalle calcula availableFormats y availableLanguages sin duplicados', async () => {
      movieRepository.findById.mockResolvedValue(persisted);
      movieRepository.findFunctionsByMovieId.mockResolvedValue([
        { id: 1, format: '2D', language: 'Español' },
        { id: 2, format: '3D', language: 'Inglés' },
        { id: 3, format: '2D', language: 'Español' },
        { id: 4, format: undefined, language: '' },
      ]);

      const detail = await service.findById(1);

      expect(detail.availableFormats).toEqual(['2D', '3D']);
      expect(detail.availableLanguages).toEqual(['Español', 'Inglés']);
    });
  });

  describe('funciones (HU-004)', () => {
    beforeEach(() => {
      movieRepository.findById.mockResolvedValue(new Movie({ id: 1 }));
    });

    it('obtiene las funciones solo desde el repository y pasa city', async () => {
      await service.getMovieFunctions(1, 'Barranquilla');

      expect(movieRepository.findById).toHaveBeenCalledWith(1);
      expect(movieRepository.findFunctionsByMovieId).toHaveBeenCalledWith(
        1,
        'Barranquilla',
      );
    });

    it('marca soldOut sin ocultar las funciones agotadas', async () => {
      movieRepository.findFunctionsByMovieId.mockResolvedValue([
        { id: 1, availableSeats: 0, price: 15000 },
        { id: 2, availableSeats: 50, price: 18000 },
        { id: 3, availableSeats: undefined, price: 15000 },
      ]);

      const functions = await service.getMovieFunctions(1);

      expect(functions.map((f) => [f.id, f.soldOut])).toEqual([
        [1, true],
        [2, false],
        [3, false],
      ]);
      expect(functions[0]).toMatchObject({ id: 1, price: 15000 });
    });

    it('película inexistente lanza NotFoundException', async () => {
      movieRepository.findById.mockResolvedValue(null);

      await expect(service.getMovieFunctions(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(movieRepository.findFunctionsByMovieId).not.toHaveBeenCalled();
    });
  });

  describe('recomendaciones (HU-004)', () => {
    it('obtiene primero la película del repository y usa su tmdbId', async () => {
      const recommendations = [{ tmdbId: 604, title: 'Matrix Reloaded' }];
      movieRepository.findById.mockResolvedValue(
        new Movie({ id: 1, tmdbId: 603 }),
      );
      vi.mocked(tmdbService.getMovieRecommendations).mockResolvedValue(
        recommendations as never,
      );

      const result = await service.getMovieRecommendations(1);

      expect(movieRepository.findById).toHaveBeenCalledWith(1);
      expect(tmdbService.getMovieRecommendations).toHaveBeenCalledWith(603);
      expect(result).toBe(recommendations);
    });

    it('sin tmdbId retorna [] sin consultar TMDB', async () => {
      movieRepository.findById.mockResolvedValue(new Movie({ id: 1 }));

      await expect(service.getMovieRecommendations(1)).resolves.toEqual([]);
      expect(tmdbService.getMovieRecommendations).not.toHaveBeenCalled();
    });

    it('película inexistente lanza NotFoundException', async () => {
      await expect(service.getMovieRecommendations(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(tmdbService.getMovieRecommendations).not.toHaveBeenCalled();
    });
  });

  describe('cartelera', () => {
    // Hora local fija: 15 oct 2026, 15:30
    const now = new Date(2026, 9, 15, 15, 30, 0, 0);

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('weekly consulta desde ahora hasta ahora + 7 días', async () => {
      const filter = { title: 'Matrix' };
      const result = await service.getWeeklyBillboard(filter);

      expect(movieRepository.findBillboard).toHaveBeenCalledWith(
        now,
        new Date(2026, 9, 22, 15, 30, 0, 0),
        filter,
      );
      expect(result.period).toBe('weekly');
      expect(result.from).toBe(now.toISOString());
    });

    it('today consulta desde ahora hasta la siguiente medianoche', async () => {
      const result = await service.getTodayBillboard();

      expect(movieRepository.findBillboard).toHaveBeenCalledWith(
        now,
        new Date(2026, 9, 16, 0, 0, 0, 0),
        {},
      );
      expect(result.period).toBe('today');
    });

    it('filtered sin date usa ahora + 7 días y period filtered', async () => {
      const result = await service.getFilteredBillboard({ format: '3D' });

      expect(movieRepository.findBillboard).toHaveBeenCalledWith(
        now,
        new Date(2026, 9, 22, 15, 30, 0, 0),
        { format: '3D' },
      );
      expect(result.period).toBe('filtered');
    });

    it('filtered con fecha válida usa [00:00 del día, 00:00 del siguiente)', async () => {
      const filter = { date: '2026-10-20' };
      const result = await service.getFilteredBillboard(filter);

      const from = new Date(2026, 9, 20, 0, 0, 0, 0);
      const to = new Date(2026, 9, 21, 0, 0, 0, 0);
      expect(movieRepository.findBillboard).toHaveBeenCalledWith(
        from,
        to,
        filter,
      );
      expect(result.period).toBe('filtered');
      expect(result.from).toBe(from.toISOString());
      expect(result.to).toBe(to.toISOString());
    });

    it.each(['2026-02-30', '2026-13-01', '2026-00-10'])(
      'fecha imposible %s lanza BadRequestException',
      async (date) => {
        await expect(service.getFilteredBillboard({ date })).rejects.toThrow(
          BadRequestException,
        );
        expect(movieRepository.findBillboard).not.toHaveBeenCalled();
      },
    );

    it('resultado vacío incluye el mensaje esperado', async () => {
      const result = await service.getWeeklyBillboard();

      expect(result.totalMovies).toBe(0);
      expect(result.movies).toEqual([]);
      expect(result.message).toBe(
        'No existen funciones activas ni películas en cartelera para los filtros seleccionados.',
      );
    });

    it('con películas no incluye message y cuenta totalMovies', async () => {
      movieRepository.findBillboard.mockResolvedValue([
        buildMovie([{ id: 1, availableSeats: 10 }]),
      ]);

      const result = await service.getWeeklyBillboard();

      expect(result.totalMovies).toBe(1);
      expect(result.message).toBeUndefined();
      expect(result.movies[0]).toMatchObject({ id: 1, title: 'Matrix' });
    });

    it('calcula soldOut según availableSeats', async () => {
      movieRepository.findBillboard.mockResolvedValue([
        buildMovie([
          { id: 1, availableSeats: 0 },
          { id: 2, availableSeats: 25 },
          { id: 3, availableSeats: undefined },
          { id: 4, availableSeats: null as unknown as number },
        ]),
      ]);

      const result = await service.getWeeklyBillboard();
      const showtimes = result.movies[0].showtimes as {
        id: number;
        soldOut: boolean;
      }[];

      expect(showtimes.map((s) => [s.id, s.soldOut])).toEqual([
        [1, true],
        [2, false],
        [3, false],
        [4, false],
      ]);
    });

    it('availableFormats y availableLanguages eliminan duplicados y vacíos', async () => {
      movieRepository.findBillboard.mockResolvedValue([
        buildMovie([
          { id: 1, format: '2D', language: 'Español' },
          { id: 2, format: '3D', language: 'Inglés' },
          { id: 3, format: '2D', language: 'Español' },
          { id: 4, format: undefined, language: '' },
        ]),
      ]);

      const result = await service.getWeeklyBillboard();

      expect(result.movies[0].availableFormats).toEqual(['2D', '3D']);
      expect(result.movies[0].availableLanguages).toEqual([
        'Español',
        'Inglés',
      ]);
    });
  });
});
