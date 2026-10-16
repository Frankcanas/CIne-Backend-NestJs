import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Room } from './room.entity.js';

@Entity({ name: 'cinemas' })
export class Cinema {
  @ApiProperty({ description: 'ID único del cine', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ description: 'Nombre del cine', example: 'Multicine Centro' })
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @ApiProperty({
    description: 'Dirección del cine',
    example: 'Calle 10 #20-30',
  })
  @Column({ type: 'varchar', length: 255 })
  address!: string;

  // Temporal: compatibilidad con Express. Se relacionará con City más adelante.
  @ApiPropertyOptional({ description: 'Ciudad del cine', example: 'Medellín' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @ApiPropertyOptional({ description: 'ID de la ciudad', example: 1 })
  @Column({ type: 'int', nullable: true })
  cityId?: number;

  @ApiPropertyOptional({ description: 'Teléfono', example: '6041234567' })
  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Correo de contacto',
    example: 'centro@multicine.com',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @ApiProperty({ description: 'Indica si el cine está activo', example: true })
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Room, (room) => room.cinema)
  rooms?: Relation<Room[]>;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
