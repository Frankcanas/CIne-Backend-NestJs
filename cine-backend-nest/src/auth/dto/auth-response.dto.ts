import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access Token JWT con vigencia de 15 minutos',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh Token JWT con vigencia de 7 días',
  })
  refreshToken!: string;

  @ApiProperty({
    example: 900,
    description: 'Tiempo de expiración en segundos del Access Token',
  })
  expiresIn!: number;
}

export class AuthUserDto {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  id!: number;

  @ApiProperty({ example: 'Carlos Ruiz', description: 'Nombre completo del usuario' })
  name!: string;

  @ApiProperty({ example: 'carlos@example.com', description: 'Correo electrónico' })
  email!: string;

  @ApiPropertyOptional({ example: 'Bogotá', description: 'Ciudad' })
  city?: string;

  @ApiPropertyOptional({ example: 'MEM-A1B2C3-XYZ123', description: 'Código de membresía' })
  membershipCode?: string;

  @ApiProperty({ example: 0, description: 'Puntos de membresía acumulados' })
  points!: number;
}

export class LoginResponseDto {
  @ApiProperty({ example: '¡Login exitoso!' })
  message!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ example: 900 })
  expiresIn!: number;

  @ApiProperty({ type: () => AuthUserDto })
  user!: AuthUserDto;
}

export class RefreshResponseDto {
  @ApiProperty({ example: 'Token refrescado exitosamente' })
  message!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ example: 900 })
  expiresIn!: number;
}
