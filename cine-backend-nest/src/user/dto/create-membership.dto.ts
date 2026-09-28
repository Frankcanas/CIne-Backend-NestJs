import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateMembershipDto {
  @ApiProperty({
    example: 'Gold',
    description: 'Nombre de la membresía',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @ApiProperty({
    example: 15.99,
    description: 'Precio de la membresía',
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  price!: number;

  @ApiProperty({
    example: 365,
    description: 'Duración en días de la membresía',
  })
  @IsNumber({}, { message: 'La duración debe ser un número entero' })
  @Min(1, { message: 'La duración mínima es 1 día' })
  durationDays!: number;

  @ApiProperty({
    example: 'Acceso a estrenos, descuentos y prioridad en reservas.',
    description: 'Descripción y beneficios de la membresía',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;
}
