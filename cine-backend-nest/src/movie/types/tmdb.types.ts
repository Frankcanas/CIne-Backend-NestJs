export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreResponse {
  genres: TMDBGenre[];
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: TMDBGenre[];
  status: string;
  tagline: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface TMDBCreditsResponse {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}
