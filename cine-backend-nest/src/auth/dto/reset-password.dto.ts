import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    description: 'Token de restablecimiento recibido por correo',
  })
  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El token es requerido' })
  token!: string;

  @ApiProperty({
    example: 'NuevaContrasenaSegura123!',
    description: 'Nueva contraseña (mínimo 10 caracteres)',
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(10, { message: 'La nueva contraseña debe tener al menos 10 caracteres' })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  newPassword!: string;
}
