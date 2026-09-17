import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
} from 'class-validator';

export interface PasswordValidationDto {
  lowercase: boolean;
  uppercase: boolean;
  hasNumber: boolean;
  specialCharacter: boolean;
  validLenght: boolean;
  isValid: boolean;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @ApiProperty({
    description: 'Número de teléfono único del usuario',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de teléfono es obligatorio' })
  phoneNumber!: string;

  @ApiProperty({
    description: 'Contraseña segura (mínimo 10 caracteres, con mayúscula, minúscula, número y símbolo)',
    example: 'SecretP@ss123',
  })
  @IsString()
  @MinLength(10, { message: 'La contraseña debe tener al menos 10 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Ciudad de residencia del usuario',
    example: 'Bogotá',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Indica si el usuario acepta recibir notificaciones comerciales por correo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notificationPreference?: boolean;

  @ApiPropertyOptional({
    description: 'Alias compatible con frontend en español para preferencia de notificaciones',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  preferenciaNotificaciones?: boolean;
}
