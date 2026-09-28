import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMovieDto {
  @ApiPropertyOptional({
    description: 'ID de la película en The Movie Database (TMDB)',
    example: 969681,
  })
  @IsOptional()
  @IsNumber()
  tmdbId?: number;

  @ApiProperty({
    description: 'Título de la película en español',
    example: 'Spider-Man: Brand New Day',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    description: 'Título original de la película',
    example: 'Spider-Man: Brand New Day',
  })
  @IsOptional()
  @IsString()
  originalTitle?: string;

  @ApiPropertyOptional({
    description: 'Sinopsis o resumen de la trama',
    example: 'Una nueva aventura de Peter Parker...',
  })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiPropertyOptional({
    description: 'URL completa del póster oficial',
    example: 'https://image.tmdb.org/t/p/w500/sample.jpg',
  })
  @IsOptional()
  @IsString()
  posterUrl?: string | null;

  @ApiPropertyOptional({
    description: 'URL completa del fondo o backdrop',
    example: 'https://image.tmdb.org/t/p/w500/backdrop.jpg',
  })
  @IsOptional()
  @IsString()
  backdropUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Fecha de estreno (YYYY-MM-DD)',
    example: '2026-07-24',
  })
  @IsOptional()
  @IsString()
  releaseDate?: string;

  @ApiPropertyOptional({
    description: 'Calificación promedio (0 a 10)',
    example: 8.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Duración en minutos',
    example: 135,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Clasificación de edad',
    example: 'PG-13',
  })
  @IsOptional()
  @IsString()
  classification?: string;

  @ApiPropertyOptional({
    description: 'Director de la película',
    example: 'Jon Watts',
  })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiPropertyOptional({
    description: 'Lista de actores principales',
    example: ['Tom Holland', 'Zendaya'],
  })
  @IsOptional()
  @IsArray()
  cast?: string[];

  @ApiPropertyOptional({
    description: 'URL del tráiler oficial en YouTube',
    example: 'https://www.youtube.com/watch?v=sample',
  })
  @IsOptional()
  @IsString()
  trailerUrl?: string;

  @ApiPropertyOptional({
    description: 'Estado de la película en cartelera',
    example: 'Cartelera',
    enum: ['Cartelera', 'Próximamente', 'Retirada'],
  })
  @IsOptional()
  @IsString()
  status?: string;
}
