import { TMDBMovie, TMDBMovieDetails } from '../types/tmdb.types.js';

export interface MappedMovie {
  tmdbId: number;
  title: string;
  originalTitle: string;
  synopsis: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  rating: number;
  voteCount: number;
  duration?: number;
  tagline?: string;
  originalLanguage?: string;
  genreIds?: number[];
  genres?: { id: number; name: string }[];
  director?: string;
  cast?: string[];
  trailerUrl?: string;
}

export class TMDBMovieMapper {
  static toDomain(tmdbMovie: TMDBMovie, imageBaseUrl: string): MappedMovie {
    return {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      originalTitle: tmdbMovie.original_title,
      synopsis: tmdbMovie.overview,
      posterUrl: tmdbMovie.poster_path
        ? `${imageBaseUrl}${tmdbMovie.poster_path}`
        : null,
      backdropUrl: tmdbMovie.backdrop_path
        ? `${imageBaseUrl}${tmdbMovie.backdrop_path}`
        : null,
      releaseDate: tmdbMovie.release_date,
      rating: tmdbMovie.vote_average,
      voteCount: tmdbMovie.vote_count,
      originalLanguage: tmdbMovie.original_language,
      genreIds: tmdbMovie.genre_ids,
    };
  }

  static toDomainDetail(
    details: TMDBMovieDetails,
    imageBaseUrl: string,
  ): MappedMovie {
    const base = this.toDomain(details, imageBaseUrl);
    return {
      ...base,
      duration: details.runtime,
      tagline: details.tagline,
      genres: details.genres
        ? details.genres.map((g) => ({ id: g.id, name: g.name }))
        : [],
    };
  }
}
