import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional } from 'class-validator';

export class SendMarketingEmailDto {
  @ApiPropertyOptional({
    example: 'cliente@correo.com',
    description:
      'Correo individual al que se enviará la promoción. Si se envía, no es obligatorio membershipId.',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico es inválido.' })
  email?: string;

  @ApiPropertyOptional({
    example: 1,
    description:
      'ID de la membresía que se promociona. Si se envía email, se usa para personalizar el contenido.',
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la membresía debe ser un entero.' })
  membershipId?: number;
}
