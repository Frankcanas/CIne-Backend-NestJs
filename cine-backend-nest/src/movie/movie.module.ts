import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieController } from './movie.controller.js';
import { Cinema } from './entities/cinema.entity.js';
import { Genre } from './entities/genre.entity.js';
import { Movie } from './entities/movie.entity.js';
import { Room } from './entities/room.entity.js';
import { Showtime } from './entities/showtime.entity.js';
import { MovieRepository } from './repositories/movie.repository.js';
import { TmdbService } from './services/tmdb.service.js';
import { MovieService } from './services/movie.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Genre, Cinema, Room, Showtime])],
  controllers: [MovieController],
  providers: [TmdbService, MovieService, MovieRepository],
  exports: [TmdbService, MovieService],
})
export class MovieModule {}
