import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador del usuario registrado al que se enviará el correo',
  })
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId!: number;

  @ApiProperty({
    example: 'Prueba desde Swagger',
    description: 'Asunto del correo electrónico',
  })
  @IsString({ message: 'El asunto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El asunto es obligatorio' })
  subject!: string;

  @ApiProperty({
    example: '<h1>Funciono</h1>',
    description: 'Contenido HTML del correo electrónico',
  })
  @IsString({ message: 'El HTML debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contenido HTML es obligatorio' })
  html!: string;
}
