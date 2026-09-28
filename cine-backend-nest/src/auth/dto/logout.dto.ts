import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID del usuario cuya sesión se desea cerrar',
  })
  @IsOptional()
  @IsInt({ message: 'El userId debe ser un número entero' })
  userId?: number;
}
