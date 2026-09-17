import bcrypt from 'bcrypt';
import { PasswordValidationDto } from '../dto/create-user.dto.js';

/**
 * Utilidades para el manejo y hashing seguro de contraseñas con bcrypt.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Valida que la contraseña cumpla con las políticas de seguridad:
 * - Al menos una letra minúscula
 * - Al menos una letra mayúscula
 * - Al menos un número
 * - Al menos un carácter especial
 * - Mínimo 10 caracteres
 */
export function validatePassword(password: string): PasswordValidationDto {
  const lowercase = /[a-z]/.test(password);
  const uppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const specialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const validLenght = typeof password === 'string' && password.length >= 10;
  const isValid =
    !!password &&
    lowercase &&
    uppercase &&
    hasNumber &&
    specialCharacter &&
    validLenght;

  return {
    lowercase,
    uppercase,
    hasNumber,
    specialCharacter,
    validLenght,
    isValid,
  };
}
