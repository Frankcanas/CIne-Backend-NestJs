import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyTokenDto {
  @ApiProperty({ example: 1, description: 'ID del usuario a verificar' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  userId!: number;

  @ApiProperty({ example: '123456', description: 'Código de verificación de 6 dígitos' })
  @IsString({ message: 'El código de verificación debe ser una cadena' })
  @Length(6, 6, { message: 'El código de verificación debe tener 6 dígitos' })
  @IsNotEmpty({ message: 'El código de verificación es obligatorio' })
  token!: string;
}
