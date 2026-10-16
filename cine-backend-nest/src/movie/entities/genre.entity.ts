import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Movie } from './movie.entity.js';

@Entity({ name: 'genres' })
export class Genre {
  @ApiProperty({ description: 'ID local único del género', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiPropertyOptional({
    description: 'ID del género en The Movie Database (TMDB)',
    example: 28,
  })
  @Column({ type: 'int', unique: true, nullable: true })
  tmdbGenreId?: number;

  @ApiProperty({ description: 'Nombre del género', example: 'Acción' })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  // Lado inverso: la tabla puente movie_genres se define en Movie.
  @ManyToMany(() => Movie, (movie) => movie.genres)
  movies?: Movie[];

  // Opcionales mientras el mapper de TMDB siga produciendo objetos { id, name }.
  @ApiPropertyOptional({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt?: Date;
}
