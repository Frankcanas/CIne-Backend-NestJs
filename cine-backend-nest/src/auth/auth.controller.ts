import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { LogoutDto } from './dto/logout.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import {
  LoginResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto.js';
import { RequestTokenDto } from './dto/request-token.dto.js';
import { VerifyTokenDto } from '../user/dto/verify-token.dto.js';
import { CurrentUserId } from '../user/decorators/current-user.decorator.js';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Iniciar sesión de usuario con Access Token (15m) y Refresh Token (7d).
   * Migrado de Express: POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión de usuario con Access Token (15m) y Refresh Token (7d)',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso con tokens JWT',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 403, description: 'Cuenta no activada / correo no verificado' })
  @ApiResponse({
    status: 423,
    description: 'Cuenta bloqueada temporalmente tras 5 intentos fallidos',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Refrescar token de acceso mediante Refresh Token.
   * Migrado de Express: POST /api/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso mediante Refresh Token' })
  @ApiResponse({
    status: 200,
    description: 'Nuevo Access Token y Refresh Token generado',
    type: RefreshResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Refresh Token inválido o expirado' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  /**
   * Cerrar sesión e invalidar Refresh Token.
   * Migrado de Express: POST /api/auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión e invalidar Refresh Token' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  async logout(
    @CurrentUserId() authenticatedUserId?: number,
    @Body() logoutDto?: LogoutDto,
  ) {
    const userId = authenticatedUserId ?? logoutDto?.userId;
    return this.authService.logout(userId);
  }

  /**
   * Solicitar restablecimiento de contraseña.
   * Migrado de Express: POST /api/auth/forgot-password
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Correo de restablecimiento enviado (si existe)',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Restablecer contraseña con token de recuperación.
   * Migrado de Express: POST /api/auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token de recuperación' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido/expirado o contraseña débil',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Solicitar código de verificación para usuario registrado.
   * Migrado de Express: POST /api/auth/request-token
   */
  @Post('request-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar código de verificación por usuario registrado',
  })
  @ApiResponse({
    status: 200,
    description: 'Código de verificación enviado al correo del usuario.',
  })
  @ApiResponse({
    status: 400,
    description: 'El userId es obligatorio.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya está verificado y no puede solicitar un nuevo código.',
  })
  async requestToken(@Body() dto: RequestTokenDto) {
    return this.authService.requestToken(dto.userId);
  }

  /**
   * Verificar código recibido para usuario registrado y activar cuenta.
   * Migrado de Express: POST /api/auth/verify-token
   */
  @Post(['verify-token', 'verify'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar código recibido para usuario registrado',
  })
  @ApiResponse({
    status: 200,
    description: 'Token validado con éxito. Cuenta activada.',
  })
  @ApiResponse({
    status: 400,
    description: 'Email o token inválidos / Token expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  async verifyToken(@Body() dto: VerifyTokenDto) {
    return this.authService.verifyToken(dto.userId, dto.token);
  }
}

