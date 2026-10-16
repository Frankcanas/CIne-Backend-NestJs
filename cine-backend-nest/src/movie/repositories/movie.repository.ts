import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillboardFilterDto } from '../dto/billboard-filter.dto.js';
import { Movie } from '../entities/movie.entity.js';
import { Showtime } from '../entities/showtime.entity.js';

@Injectable()
export class MovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly repository: Repository<Movie>,
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
  ) {}

  async findBillboard(
    from: Date,
    to: Date,
    filter: BillboardFilterDto = {},
  ): Promise<Movie[]> {
    const query = this.repository
      .createQueryBuilder('movie')
      .innerJoinAndSelect('movie.showtimes', 'showtime')
      .innerJoinAndSelect('showtime.room', 'room')
      .innerJoinAndSelect('room.cinema', 'cinema')
      .leftJoinAndSelect('movie.genres', 'genre')
      .where('movie.isActive = :isActive', { isActive: true })
      .andWhere('showtime.startTime >= :from', { from })
      .andWhere('showtime.startTime < :to', { to })
      .andWhere('showtime.status = :status', { status: 'AVAILABLE' })
      .andWhere('room.isActive = :roomActive', { roomActive: true })
      .andWhere('cinema.isActive = :cinemaActive', { cinemaActive: true });

    if (filter.title) {
      query.andWhere('movie.title ILIKE :title', {
        title: `%${filter.title}%`,
      });
    }

    if (filter.classification) {
      query.andWhere('movie.classification = :classification', {
        classification: filter.classification,
      });
    }

    if (filter.language) {
      query.andWhere('showtime.language = :language', {
        language: filter.language,
      });
    }

    if (filter.format) {
      query.andWhere('showtime.format = :format', { format: filter.format });
    }

    if (filter.available === true) {
      query.andWhere('showtime.availableSeats > 0');
    }

    if (filter.roomType) {
      query.andWhere('room.type = :roomType', { roomType: filter.roomType });
    }

    if (filter.cinemaId) {
      query.andWhere('cinema.id = :cinemaId', { cinemaId: filter.cinemaId });
    }

    // Temporal: Express filtra por City.name (ILIKE sin comodines).
    // Usamos cinema.city hasta migrar la relación Cinema -> City.
    if (filter.city) {
      query.andWhere('cinema.city ILIKE :city', { city: filter.city });
    }

    // ID local de Genre, no tmdbGenreId.
    if (filter.genreId) {
      query.andWhere('genre.id = :genreId', { genreId: filter.genreId });
    }

    return query.orderBy('showtime.startTime', 'ASC').getMany();
  }

  async findById(id: number): Promise<Movie | null> {
    return this.repository.findOne({
      where: { id },
      relations: { genres: true },
    });
  }

  async findByTmdbId(tmdbId: number): Promise<Movie | null> {
    return this.repository.findOne({
      where: { tmdbId },
      relations: { genres: true },
    });
  }

  async findFunctionsByMovieId(
    movieId: number,
    city?: string,
  ): Promise<Showtime[]> {
    const query = this.showtimeRepository
      .createQueryBuilder('showtime')
      .innerJoinAndSelect('showtime.room', 'room')
      .innerJoinAndSelect('room.cinema', 'cinema')
      .where('showtime.movieId = :movieId', { movieId })
      .andWhere('showtime.startTime >= :now', { now: new Date() })
      .andWhere('showtime.status = :status', { status: 'AVAILABLE' })
      .andWhere('room.isActive = :roomActive', { roomActive: true })
      .andWhere('cinema.isActive = :cinemaActive', { cinemaActive: true });

    // Temporal: comparación exacta sin distinguir mayúsculas hasta migrar City.
    if (city) {
      query.andWhere('cinema.city ILIKE :city', { city });
    }

    return query.orderBy('showtime.startTime', 'ASC').getMany();
  }
}
