import {
  Injectable,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Movie } from '../entities/movie.entity.js';
import { CreateMovieDto } from '../dto/create-movie.dto.js';
import { UpdateMovieDto } from '../dto/update-movie.dto.js';
import { MovieFilterDto } from '../dto/movie-filter.dto.js';
import { TmdbService } from './tmdb.service.js';
import { MappedMovie } from '../mappers/tmdb-movie.mapper.js';

@Injectable()
export class MovieService implements OnModuleInit {
  private readonly logger = new Logger(MovieService.name);
  private movies: Movie[] = [];
  private genres: { id: number; name: string }[] = [];
  private movieIdCounter = 1;

  constructor(private readonly tmdbService: TmdbService) {}

  async onModuleInit() {
    // Carga inicial suave de películas populares de TMDB para que el equipo tenga datos listos
    this.seedInitialMovies().catch((err) =>
      this.logger.warn(`No se pudo precargar películas de TMDB: ${err.message}`),
    );
  }

  private async seedInitialMovies(): Promise<void> {
    try {
      const popular = await this.tmdbService.getPopularMovies(1, 'es-ES');
      for (const item of popular.slice(0, 10)) {
        this.addMovieFromMapped(item, 'Cartelera');
      }
      this.logger.log(
        `Catálogo inicial de películas precargado exitosamente (${this.movies.length} películas).`,
      );
    } catch (err: any) {
      this.logger.warn(`Precarga inicial omitida: ${err.message}`);
    }
  }

  private addMovieFromMapped(
    mapped: MappedMovie,
    status: string = 'Cartelera',
  ): Movie {
    const existing = this.movies.find((m) => m.tmdbId === mapped.tmdbId);
    if (existing) {
      existing.title = mapped.title;
      existing.originalTitle = mapped.originalTitle;
      existing.synopsis = mapped.synopsis;
      existing.posterUrl = mapped.posterUrl;
      existing.backdropUrl = mapped.backdropUrl;
      existing.releaseDate = mapped.releaseDate;
      existing.rating = mapped.rating;
      existing.voteCount = mapped.voteCount;
      if (mapped.duration) existing.duration = mapped.duration;
      if (mapped.genres) existing.genres = mapped.genres;
      if (mapped.director) existing.director = mapped.director;
      if (mapped.cast) existing.cast = mapped.cast;
      if (mapped.trailerUrl) existing.trailerUrl = mapped.trailerUrl;
      existing.updatedAt = new Date();
      return existing;
    }

    const movie = new Movie({
      id: this.movieIdCounter++,
      tmdbId: mapped.tmdbId,
      title: mapped.title,
      originalTitle: mapped.originalTitle,
      synopsis: mapped.synopsis,
      posterUrl: mapped.posterUrl,
      backdropUrl: mapped.backdropUrl,
      releaseDate: mapped.releaseDate,
      rating: mapped.rating,
      voteCount: mapped.voteCount,
      duration: mapped.duration,
      tagline: mapped.tagline,
      director: mapped.director,
      cast: mapped.cast,
      genres: mapped.genres,
      trailerUrl: mapped.trailerUrl,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.movies.push(movie);
    return movie;
  }

  async getMovies(filter?: MovieFilterDto): Promise<Movie[]> {
    let result = [...this.movies];

    if (filter?.title) {
      const term = filter.title.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(term) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(term)),
      );
    }

    if (filter?.status) {
      const status = filter.status.toLowerCase().trim();
      result = result.filter((m) => m.status.toLowerCase() === status);
    }

    if (filter?.genreId) {
      const genreId = Number(filter.genreId);
      result = result.filter((m) =>
        m.genres?.some((g) => g.id === genreId),
      );
    }

    return result;
  }

  async findById(id: number): Promise<Movie> {
    const movie = this.movies.find((m) => m.id === id);
    if (!movie) {
      throw new NotFoundException(`Película con ID ${id} no encontrada`);
    }
    return movie;
  }

  async findByTmdbId(tmdbId: number): Promise<Movie | null> {
    return this.movies.find((m) => m.tmdbId === tmdbId) ?? null;
  }

  async createMovie(dto: CreateMovieDto): Promise<Movie> {
    const movie = new Movie({
      id: this.movieIdCounter++,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.movies.push(movie);
    return movie;
  }

  async updateMovie(id: number, dto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findById(id);
    Object.assign(movie, dto, { updatedAt: new Date() });
    return movie;
  }

  async deleteMovie(id: number): Promise<{ message: string }> {
    const index = this.movies.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException(`Película con ID ${id} no encontrada`);
    }
    this.movies.splice(index, 1);
    return { message: 'Película eliminada correctamente' };
  }

  async syncWithTmdb(tmdbId: number): Promise<Movie> {
    const details = await this.tmdbService.getMovieDetails(tmdbId);
    return this.addMovieFromMapped(details, 'Cartelera');
  }

  async syncGenresFromTmdb(): Promise<{ id: number; name: string }[]> {
    const genres = await this.tmdbService.getGenres();
    this.genres = genres;
    return genres;
  }

  async getMovieRecommendations(id: number): Promise<MappedMovie[]> {
    const movie = await this.findById(id);
    if (movie.tmdbId) {
      return this.tmdbService.getMovieRecommendations(movie.tmdbId);
    }
    return [];
  }
}
