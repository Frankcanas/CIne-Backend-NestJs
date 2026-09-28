import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TMDBMovie,
  TMDBResponse,
  TMDBMovieDetails,
  TMDBGenreResponse,
  TMDBCreditsResponse,
  TMDBVideosResponse,
  TMDBGenre,
} from '../types/tmdb.types.js';
import { TMDBMovieMapper, MappedMovie } from '../mappers/tmdb-movie.mapper.js';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly accessToken: string;
  private readonly imageBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('TMDB_BASE_URL') ||
      'https://api.themoviedb.org/3';
    this.apiKey =
      this.configService.get<string>('TMDB_API_KEY') ||
      'ea8f4b8e54c39763ad29521391245594';
    this.accessToken = this.configService.get<string>('TMDB_ACCESS_TOKEN') || '';
    this.imageBaseUrl =
      this.configService.get<string>('TMDB_IMAGE_BASE_URL') ||
      'https://image.tmdb.org/t/p/w500';
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  private buildUrl(
    endpoint: string,
    params: Record<string, string | number> = {},
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (this.apiKey && !this.accessToken) {
      url.searchParams.append('api_key', this.apiKey);
    }
    Object.entries(params).forEach(([key, val]) => {
      url.searchParams.append(key, String(val));
    });
    return url.toString();
  }

  async getPopularMovies(
    page: number = 1,
    language: string = 'es-ES',
  ): Promise<MappedMovie[]> {
    const url = this.buildUrl('/movie/popular', { page, language });
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(
        `Error en TMDB Service (${response.status}): ${response.statusText}`,
      );
    }
    const data = (await response.json()) as TMDBResponse<TMDBMovie>;
    return data.results.map((movie) =>
      TMDBMovieMapper.toDomain(movie, this.imageBaseUrl),
    );
  }

  async getNowPlayingMovies(
    page: number = 1,
    language: string = 'es-ES',
  ): Promise<MappedMovie[]> {
    const url = this.buildUrl('/movie/now_playing', { page, language });
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(
        `Error al obtener cartelera de TMDB (${response.status}): ${response.statusText}`,
      );
    }
    const data = (await response.json()) as TMDBResponse<TMDBMovie>;
    return data.results.map((movie) =>
      TMDBMovieMapper.toDomain(movie, this.imageBaseUrl),
    );
  }

  async getUpcomingMovies(
    page: number = 1,
    language: string = 'es-ES',
  ): Promise<MappedMovie[]> {
    const url = this.buildUrl('/movie/upcoming', { page, language });
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(
        `Error al obtener próximos estrenos de TMDB (${response.status}): ${response.statusText}`,
      );
    }
    const data = (await response.json()) as TMDBResponse<TMDBMovie>;
    return data.results.map((movie) =>
      TMDBMovieMapper.toDomain(movie, this.imageBaseUrl),
    );
  }

  async getTopRatedMovies(
    page: number = 1,
    language: string = 'es-ES',
  ): Promise<MappedMovie[]> {
    const url = this.buildUrl('/movie/top_rated', { page, language });
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(
        `Error al obtener películas mejor valoradas de TMDB (${response.status}): ${response.statusText}`,
      );
    }
    const data = (await response.json()) as TMDBResponse<TMDBMovie>;
    return data.results.map((movie) =>
      TMDBMovieMapper.toDomain(movie, this.imageBaseUrl),
    );
  }

  async searchMovies(
    query: string,
    page: number = 1,
    language: string = 'es-ES',
  ): Promise<MappedMovie[]> {
    const url = this.buildUrl('/search/movie', { query, page, language });
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(
        `Error al buscar películas en TMDB (${response.status}): ${response.statusText}`,
      );
    }
    const data = (await response.json()) as TMDBResponse<TMDBMovie>;
    return data.results.map((movie) =>
      TMDBMovieMapper.toDomain(movie, this.imageBaseUrl),
    );
  }

  async getMovieDetails(
    tmdbId: number,
    language: string = 'es-ES',
  ): Promise<MappedMovie> {
    const url = this.buildUrl(`/movie/${tmdbId}`, { language });
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(
        `Error al obtener detalle de TMDB ID ${tmdbId}: ${response.statusText}`,
      );
    }
    const data = (await response.json()) as TMDBMovieDetails;
    const mapped = TMDBMovieMapper.toDomainDetail(data, this.imageBaseUrl);

    try {
      const [credits, videos] = await Promise.all([
        this.getMovieCredits(tmdbId),
        this.getMovieVideos(tmdbId),
      ]);

      const director = credits.crew?.find((c) => c.job === 'Director')?.name;
      const cast = credits.cast?.slice(0, 8).map((c) => c.name) || [];
      const trailer = videos.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer',
      );
      const trailerUrl = trailer
        ? `https://www.youtube.com/watch?v=${trailer.key}`
        : undefined;

      mapped.director = director;
      mapped.cast = cast;
      if (trailerUrl) mapped.trailerUrl = trailerUrl;
    } catch (err) {
      this.logger.warn(`No se pudieron cargar créditos/videos para TMDB ID ${tmdbId}: ${err}`);
    }

    return mapped;
  }

  async getMovieCredits(tmdbId: number): Promise<TMDBCreditsResponse> {
    const url = this.buildUrl(`/movie/${tmdbId}/credits`);
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      return { id: tmdbId, cast: [], crew: [] };
    }
    return (await response.json()) as TMDBCreditsResponse;
  }

  async getMovieVideos(tmdbId: number): Promise<TMDBVideosResponse['results']> {
    const url = this.buildUrl(`/movie/${tmdbId}/videos`);
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as TMDBVideosResponse;
    return data.results || [];
  }

  async getMovieRecommendations(
    tmdbId: number,
    page: number = 1,
    language: string = 'es-ES',
  ): Promise<MappedMovie[]> {
    const url = this.buildUrl(`/movie/${tmdbId}/recommendations`, {
      page,
      language,
    });
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as TMDBResponse<TMDBMovie>;
    return (data.results || []).map((movie) =>
      TMDBMovieMapper.toDomain(movie, this.imageBaseUrl),
    );
  }

  async getGenres(language: string = 'es-ES'): Promise<TMDBGenre[]> {
    const url = this.buildUrl('/genre/movie/list', { language });
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(
        `Error al obtener géneros de TMDB (${response.status}): ${response.statusText}`,
      );
    }
    const data = (await response.json()) as TMDBGenreResponse;
    return data.genres;
  }
}
