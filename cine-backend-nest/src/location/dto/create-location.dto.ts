import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({ description: 'Nombre del país', example: 'Colombia' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreateCityDto {
  @ApiProperty({ description: 'Nombre de la ciudad', example: 'Medellín' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'ID del país al que pertenece la ciudad', example: 1 })
  @IsInt()
  @IsPositive()
  countryId!: number;

  @ApiPropertyOptional({ description: 'Indica si la ciudad está activa', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class SetUserLocationDto {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  @IsInt()
  @IsPositive()
  userId!: number;

  @ApiProperty({ description: 'Nombre de la ciudad preferida', example: 'Medellín' })
  @IsString()
  @IsNotEmpty()
  city!: string;
}

export class CreateLocationDto {
  @ApiPropertyOptional({ description: 'Nombre del país', example: 'Colombia' })
  @IsString()
  @IsOptional()
  countryName?: string;

  @ApiPropertyOptional({ description: 'Nombre de la ciudad', example: 'Medellín' })
  @IsString()
  @IsOptional()
  cityName?: string;

  @ApiPropertyOptional({ description: 'ID del país para asociar la ciudad', example: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  countryId?: number;

  @ApiPropertyOptional({ description: 'Indica si la ubicación o ciudad está activa', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
