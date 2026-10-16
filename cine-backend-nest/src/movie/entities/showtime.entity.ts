import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Movie } from './movie.entity.js';
import { Room } from './room.entity.js';

@Entity({ name: 'showtimes' })
@Index('idx_showtimes_movie', ['movieId'])
@Index('idx_showtimes_room', ['roomId'])
@Index('idx_showtimes_format', ['format'])
@Index('idx_showtimes_language', ['language'])
@Index('idx_showtimes_audiotype', ['audioType'])
@Index('idx_showtimes_starttime', ['startTime'])
@Index('idx_showtimes_status', ['status'])
export class Showtime {
  @ApiProperty({ description: 'ID único de la función', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'ID de la película', example: 1 })
  @Column({ type: 'int' })
  movieId!: number;

  @ApiProperty({ description: 'ID de la sala', example: 1 })
  @Column({ type: 'int' })
  roomId!: number;

  @ApiProperty({ description: 'Fecha y hora de inicio' })
  @Column({ type: 'timestamptz' })
  startTime!: Date;

  @ApiProperty({ description: 'Fecha y hora de finalización' })
  @Column({ type: 'timestamptz' })
  endTime!: Date;

  // pg devuelve NUMERIC como string para no perder precisión; la API expone number.
  @ApiProperty({ description: 'Precio de la entrada', example: 15000 })
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  price!: number;

  @ApiPropertyOptional({ description: 'Idioma', example: 'Español' })
  @Column({ type: 'varchar', length: 50, nullable: true, default: 'Español' })
  language?: string;

  @ApiPropertyOptional({ description: 'Tipo de audio', example: 'DOBLADA' })
  @Column({ type: 'varchar', length: 30, nullable: true, default: 'DOBLADA' })
  audioType?: string;

  @ApiPropertyOptional({ description: 'Formato de proyección', example: '2D' })
  @Column({ type: 'varchar', length: 30, nullable: true, default: '2D' })
  format?: string;

  @ApiPropertyOptional({ description: 'Asientos disponibles', example: 80 })
  @Column({ type: 'int', nullable: true })
  availableSeats?: number;

  @ApiProperty({ description: 'Estado de la función', example: 'AVAILABLE' })
  @Column({ type: 'varchar', length: 30, default: 'AVAILABLE' })
  status!: string;

  @ApiProperty({ description: 'Máximo de asientos por reserva', example: 6 })
  @Column({
    name: 'max_seats_per_reservation',
    type: 'int',
    default: 6,
  })
  maxSeatsPerReservation!: number;

  @ManyToOne(() => Movie, (movie) => movie.showtimes)
  @JoinColumn({ name: 'movieId' })
  movie?: Relation<Movie>;

  @ManyToOne(() => Room, (room) => room.showtimes)
  @JoinColumn({ name: 'roomId' })
  room?: Relation<Room>;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
