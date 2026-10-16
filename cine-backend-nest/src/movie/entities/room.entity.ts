import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Cinema } from './cinema.entity.js';
import { Showtime } from './showtime.entity.js';

@Entity({ name: 'rooms' })
@Index('idx_rooms_cinema', ['cinemaId'])
export class Room {
  @ApiProperty({ description: 'ID único de la sala', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'ID del cine al que pertenece', example: 1 })
  @Column({ type: 'int' })
  cinemaId!: number;

  @ApiProperty({ description: 'Nombre de la sala', example: 'Sala 1' })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @ApiProperty({ description: 'Capacidad total de la sala', example: 120 })
  @Column({ type: 'int' })
  capacity!: number;

  @ApiProperty({ description: 'Tipo de sala', example: '2D', default: '2D' })
  @Column({ type: 'varchar', length: 50, default: '2D' })
  type!: string;

  @ApiPropertyOptional({ description: 'Tipo de pantalla', example: 'IMAX' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  screenType?: string;

  @ApiPropertyOptional({
    description: 'Sistema de sonido',
    example: 'Dolby Atmos',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  soundSystem?: string;

  @ApiPropertyOptional({ description: 'Cantidad de filas', example: 10 })
  @Column({ type: 'int', nullable: true })
  totalRows?: number;

  @ApiPropertyOptional({ description: 'Asientos por fila', example: 12 })
  @Column({ type: 'int', nullable: true })
  seatsPerRow?: number;

  @ApiProperty({ description: 'Indica si la sala está activa', example: true })
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => Cinema, (cinema) => cinema.rooms)
  @JoinColumn({ name: 'cinemaId' })
  cinema?: Relation<Cinema>;

  @OneToMany(() => Showtime, (showtime) => showtime.room)
  showtimes?: Relation<Showtime[]>;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
