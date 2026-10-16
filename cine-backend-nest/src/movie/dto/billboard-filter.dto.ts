import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

// No se usa @Type(() => Boolean) porque Boolean('false') === true.
// Cualquier valor distinto de true/false se conserva para que @IsBoolean() lo rechace.
const toBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

export class BillboardFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por título o parte del título',
    example: 'Spider',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Fecha de las funciones (YYYY-MM-DD)',
    example: '2026-10-20',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener el formato YYYY-MM-DD',
  })
  date?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID local del género',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  genreId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por clasificación de edad',
    example: 'PG-13',
  })
  @IsOptional()
  @IsString()
  classification?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por idioma de la función',
    example: 'Español',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de sala',
    example: '2D',
  })
  @IsOptional()
  @IsString()
  roomType?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por formato de proyección',
    example: '3D',
  })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del cine',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cinemaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ciudad del cine',
    example: 'Medellín',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Solo funciones con asientos disponibles',
    example: true,
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  available?: boolean;
}
