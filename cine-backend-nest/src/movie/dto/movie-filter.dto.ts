import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class MovieFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por título o parte del título',
    example: 'Spider',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de género',
    example: 28,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  genreId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado (Cartelera, Próximamente, Retirada)',
    example: 'Cartelera',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
