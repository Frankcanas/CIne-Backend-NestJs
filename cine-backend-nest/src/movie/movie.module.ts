import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller.js';
import { TmdbService } from './services/tmdb.service.js';
import { MovieService } from './services/movie.service.js';

@Module({
  controllers: [MovieController],
  providers: [TmdbService, MovieService],
  exports: [TmdbService, MovieService],
})
export class MovieModule {}
