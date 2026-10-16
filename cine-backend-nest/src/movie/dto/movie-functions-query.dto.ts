import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MovieFunctionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar funciones por ciudad del cine',
    example: 'Barranquilla',
  })
  @IsOptional()
  @IsString()
  city?: string;
}
