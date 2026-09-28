import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh Token JWT válido para renovar la sesión',
  })
  @IsString({ message: 'El refreshToken debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El refreshToken es requerido' })
  refreshToken!: string;
}
