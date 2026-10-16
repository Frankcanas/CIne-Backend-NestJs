import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Genre } from './genre.entity.js';
import { Showtime } from './showtime.entity.js';

@Entity({ name: 'movies' })
export class Movie {
  @ApiProperty({ description: 'ID local único de la película', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiPropertyOptional({
    description: 'ID de la película en The Movie Database (TMDB)',
    example: 969681,
  })
  @Column({ type: 'int', unique: true, nullable: true })
  tmdbId?: number;

  @ApiProperty({
    description: 'Título de la película en español',
    example: 'Spider-Man: Brand New Day',
  })
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ApiPropertyOptional({
    description: 'Título original',
    example: 'Spider-Man: Brand New Day',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  originalTitle?: string;

  @ApiPropertyOptional({
    description: 'Sinopsis o resumen de la trama',
    example: 'Una nueva aventura de Peter Parker...',
  })
  @Column({ type: 'text', nullable: true })
  synopsis?: string;

  @ApiPropertyOptional({
    description: 'URL completa del póster oficial',
    example: 'https://image.tmdb.org/t/p/w500/sample.jpg',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  posterUrl?: string | null;

  @ApiPropertyOptional({
    description: 'URL completa del fondo o backdrop',
    example: 'https://image.tmdb.org/t/p/w500/backdrop.jpg',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  backdropUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Fecha de estreno',
    example: '2026-07-24',
  })
  @Column({ type: 'date', nullable: true })
  releaseDate?: string;

  @ApiPropertyOptional({
    description: 'Calificación promedio (0 a 10)',
    example: 8.5,
  })
  @Column({ type: 'float', default: 0 })
  rating: number = 0;

  @ApiPropertyOptional({
    description: 'Cantidad de votos',
    example: 1250,
  })
  @Column({ type: 'int', default: 0 })
  voteCount: number = 0;

  @ApiPropertyOptional({
    description: 'Duración en minutos',
    example: 135,
  })
  @Column({ type: 'int', nullable: true })
  duration?: number;

  @ApiPropertyOptional({
    description: 'Clasificación de edad',
    example: 'PG-13',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  classification?: string;

  @ApiPropertyOptional({
    description: 'Lema o frase publicitaria',
    example: 'El héroe del vecindario regresa.',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Director de la película',
    example: 'Jon Watts',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  director?: string;

  @ApiPropertyOptional({
    description: 'Lista de actores principales',
    example: ['Tom Holland', 'Zendaya'],
  })
  @Column({ type: 'jsonb', nullable: true })
  cast?: string[];

  @ApiPropertyOptional({
    description: 'Lista de géneros asociados',
    type: () => [Genre],
  })
  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable({
    name: 'movie_genres',
    joinColumn: {
      name: 'movieId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'genreId',
      referencedColumnName: 'id',
    },
  })
  genres?: Genre[];

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes?: Relation<Showtime[]>;

  @ApiPropertyOptional({
    description: 'URL del tráiler oficial en YouTube',
    example: 'https://www.youtube.com/watch?v=sample',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  trailerUrl?: string;

  @ApiProperty({
    description: 'Estado de la película en cartelera',
    example: 'EN_CARTELERA',
    default: 'EN_CARTELERA',
  })
  @Column({ type: 'varchar', length: 50, default: 'EN_CARTELERA' })
  status: string = 'EN_CARTELERA';

  @ApiPropertyOptional({
    description: 'Idioma original (código ISO 639-1)',
    example: 'en',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  originalLanguage?: string;

  @ApiProperty({
    description: 'Indica si la película está activa en el sistema',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean = true;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  constructor(partial?: Partial<Movie>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
