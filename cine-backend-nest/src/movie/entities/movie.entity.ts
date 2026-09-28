import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Movie {
  @ApiProperty({ description: 'ID local único de la película', example: 1 })
  id!: number;

  @ApiPropertyOptional({
    description: 'ID de la película en The Movie Database (TMDB)',
    example: 969681,
  })
  tmdbId?: number;

  @ApiProperty({
    description: 'Título de la película en español',
    example: 'Spider-Man: Brand New Day',
  })
  title!: string;

  @ApiPropertyOptional({
    description: 'Título original',
    example: 'Spider-Man: Brand New Day',
  })
  originalTitle?: string;

  @ApiPropertyOptional({
    description: 'Sinopsis o resumen de la trama',
    example: 'Una nueva aventura de Peter Parker...',
  })
  synopsis?: string;

  @ApiPropertyOptional({
    description: 'URL completa del póster oficial',
    example: 'https://image.tmdb.org/t/p/w500/sample.jpg',
  })
  posterUrl?: string | null;

  @ApiPropertyOptional({
    description: 'URL completa del fondo o backdrop',
    example: 'https://image.tmdb.org/t/p/w500/backdrop.jpg',
  })
  backdropUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Fecha de estreno',
    example: '2026-07-24',
  })
  releaseDate?: string;

  @ApiPropertyOptional({
    description: 'Calificación promedio (0 a 10)',
    example: 8.5,
  })
  rating: number = 0;

  @ApiPropertyOptional({
    description: 'Cantidad de votos',
    example: 1250,
  })
  voteCount: number = 0;

  @ApiPropertyOptional({
    description: 'Duración en minutos',
    example: 135,
  })
  duration?: number;

  @ApiPropertyOptional({
    description: 'Clasificación de edad',
    example: 'PG-13',
  })
  classification?: string;

  @ApiPropertyOptional({
    description: 'Lema o frase publicitaria',
    example: 'El héroe del vecindario regresa.',
  })
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Director de la película',
    example: 'Jon Watts',
  })
  director?: string;

  @ApiPropertyOptional({
    description: 'Lista de actores principales',
    example: ['Tom Holland', 'Zendaya'],
  })
  cast?: string[];

  @ApiPropertyOptional({
    description: 'Lista de géneros asociados',
    example: [{ id: 28, name: 'Acción' }],
  })
  genres?: { id: number; name: string }[];

  @ApiPropertyOptional({
    description: 'URL del tráiler oficial en YouTube',
    example: 'https://www.youtube.com/watch?v=sample',
  })
  trailerUrl?: string;

  @ApiProperty({
    description: 'Estado de la película en cartelera',
    example: 'Cartelera',
    default: 'Cartelera',
  })
  status: string = 'Cartelera';

  @ApiProperty({ description: 'Fecha de creación del registro' })
  createdAt: Date = new Date();

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date = new Date();

  constructor(partial?: Partial<Movie>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
