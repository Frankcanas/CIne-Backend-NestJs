import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class TmdbQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página a consultar',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Código de idioma de los resultados (formato ISO 639-1)',
    example: 'es-ES',
    default: 'es-ES',
  })
  @IsOptional()
  @IsString()
  language: string = 'es-ES';
}

export class TmdbSearchQueryDto extends TmdbQueryDto {
  @ApiPropertyOptional({
    description: 'Término de búsqueda o título de la película',
    example: 'Spider-Man',
  })
  @IsOptional()
  @IsString()
  query?: string;
}
