import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MembershipStatusDto {
  @ApiProperty({ example: true, description: 'Estado activo de la membresía' })
  active!: boolean;

  @ApiPropertyOptional({ example: '1', description: 'Nivel de la membresía' })
  level!: string | null;

  @ApiProperty({ example: 120, description: 'Puntos acumulados' })
  points!: number;

  @ApiPropertyOptional({ example: 'Clásica', description: 'Nombre de la membresía' })
  membershipName!: string | null;

  @ApiPropertyOptional({
    example: 'Membresía inicial con acumulación básica de puntos',
    description: 'Beneficios de la membresía',
  })
  benefits!: string | null;

  @ApiPropertyOptional({
    example: '2027-09-16T12:00:00.000Z',
    description: 'Fecha de vencimiento de la membresía',
  })
  expiresAt!: Date | null;
}

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  id!: number;

  @ApiProperty({ example: 'John Doe', description: 'Nombre completo' })
  name!: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Correo electrónico' })
  email!: string;

  @ApiProperty({ example: '1234567890', description: 'Teléfono' })
  phoneNumber!: string;

  @ApiPropertyOptional({ example: 'Bogotá', description: 'Ciudad' })
  city?: string;

  @ApiProperty({ example: true, description: 'Preferencia de notificaciones' })
  notificationPreference!: boolean;

  @ApiProperty({ type: () => MembershipStatusDto, description: 'Estado de la membresía' })
  membership!: MembershipStatusDto;
}
