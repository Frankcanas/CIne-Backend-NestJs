import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service.js';
import { EmailService } from '../email/email.service.js';
import { comparePassword, hashPassword } from '../user/utils/password.util.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { LoginResponseDto, RefreshResponseDto } from './dto/auth-response.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Inicia sesión con email y contraseña:
   * 1. Verifica intentos fallidos y bloqueo temporal (HU-007)
   * 2. Compara el hash de la contraseña con bcrypt
   * 3. Verifica activación de la cuenta (HU-006)
   * 4. Genera Access Token (15m) y Refresh Token (7d)
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 1. Verificar bloqueo por intentos fallidos (HU-007)
    if (user.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockoutUntil).getTime() - Date.now()) / (60 * 1000),
      );
      throw new HttpException(
        `Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en ${remainingMinutes} minuto(s).`,
        HttpStatus.LOCKED,
      );
    }

    // 2. Verificar contraseña
    const passwordMatches = await comparePassword(dto.password, user.password);
    if (!passwordMatches) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de bloqueo
        user.failedLoginAttempts = 0;
        throw new HttpException(
          'Has superado el límite de 5 intentos fallidos. Tu cuenta ha sido bloqueada por 15 minutos.',
          HttpStatus.LOCKED,
        );
      }
      throw new UnauthorizedException(
        `Credenciales inválidas. Intentos restantes: ${5 - user.failedLoginAttempts}`,
      );
    }

    // 3. Verificar si el usuario está verificado o activo (HU-006 / HU-007)
    if (!user.isVerified && !user.isActive) {
      throw new ForbiddenException(
        'Tu cuenta no ha sido activada. Por favor verifica tu correo electrónico con el código de 6 dígitos.',
      );
    }

    // Resetear intentos fallidos tras login exitoso
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;

    // 4. Generar Access Token (15m) y Refresh Token (7 días)
    const secret = process.env.JWT_SECRET || 'secret_key';
    const payload = { userId: user.id, email: user.email };

    const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

    user.refreshToken = refreshToken;

    return {
      message: '¡Login exitoso!',
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        membershipCode: user.membershipCode,
        points: user.points || 0,
      },
    };
  }

  /**
   * Refresca el Access Token utilizando un Refresh Token válido.
   */
  async refresh(dto: RefreshTokenDto): Promise<RefreshResponseDto> {
    if (!dto.refreshToken) {
      throw new BadRequestException('Refresh token requerido');
    }

    const secret = process.env.JWT_SECRET || 'secret_key';
    let decoded: any;
    try {
      decoded = jwt.verify(dto.refreshToken, secret);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.userService.findById(decoded.userId);
    if (!user || user.refreshToken !== dto.refreshToken) {
      throw new UnauthorizedException('Refresh token revocado o no coincide');
    }

    const payload = { userId: user.id, email: user.email };
    const newAccessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

    user.refreshToken = newRefreshToken;

    return {
      message: 'Token refrescado exitosamente',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    };
  }

  /**
   * Cierra la sesión e invalida el Refresh Token almacenado.
   */
  async logout(userId?: number): Promise<{ message: string }> {
    if (userId) {
      const user = await this.userService.findById(userId);
      if (user) {
        user.refreshToken = null;
      }
    }
    return { message: 'Sesión cerrada correctamente' };
  }

  /**
   * Solicita el restablecimiento de contraseña generando un token seguro.
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      return {
        message:
          'Si el correo está registrado, se ha enviado un enlace de restablecimiento.',
      };
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    try {
      await this.emailService.passwordRecoveryEmail(user.email, resetToken);
    } catch (err) {
      console.error('Error al enviar email de recuperación:', err);
    }

    return {
      message:
        'Si el correo está registrado, se ha enviado un enlace de restablecimiento.',
    };
  }

  /**
   * Restablece la contraseña utilizando el token de recuperación.
   */
  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    if (!dto.token || !dto.newPassword || dto.newPassword.length < 10) {
      throw new BadRequestException(
        'Token y contraseña válida (mínimo 10 caracteres) requeridos',
      );
    }

    const user = await this.userService.findByResetToken(dto.token);

    if (
      !user ||
      !user.resetPasswordExpires ||
      new Date() > new Date(user.resetPasswordExpires)
    ) {
      throw new BadRequestException(
        'Token de restablecimiento inválido o expirado',
      );
    }

    user.password = await hashPassword(dto.newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente.',
    };
  }

  /**
   * Solicita el código de verificación para un usuario registrado y lo envía por correo.
   * Migrado de Express: POST /api/auth/request-token
   */
  async requestToken(userId: number): Promise<{ message: string }> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const { token } = await this.userService.requestVerificationToken(
      user.id,
      user.email,
    );

    try {
      await this.emailService.sendVerificationEmail(user.email, token);
    } catch (err) {
      console.error('Error enviando correo de verificación:', err);
    }

    return { message: 'Código de verificación enviado al correo del usuario.' };
  }

  /**
   * Verifica el código de 6 dígitos para activar la cuenta de un usuario.
   * Migrado de Express: POST /api/auth/verify-token
   */
  async verifyToken(
    userId: number,
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const result = await this.userService.verifyToken(user.id, token);
    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return result;
  }
}

