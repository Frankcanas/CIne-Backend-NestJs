import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class RequestTokenDto {
  @ApiProperty({
    example: 1,
    description: 'ID del usuario registrado que recibirá el código',
  })
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @IsNotEmpty({ message: 'El userId es obligatorio.' })
  userId!: number;
}
