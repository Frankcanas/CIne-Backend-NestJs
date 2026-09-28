import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service.js';
import { UserService } from '../user/user.service.js';
import { SendEmailDto } from './dto/send-email.dto.js';
import { SendMarketingEmailDto } from './dto/send-marketing-email.dto.js';

@ApiTags('Mail')
@Controller(['mail', 'email'])
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Enviar correo a usuario registrado.
   * Migrado de Express: POST /api/mail/email
   */
  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar correo a usuario registrado' })
  @ApiResponse({
    status: 200,
    description: 'Correo enviado correctamente',
    schema: {
      example: {
        success: true,
        message: 'Correo enviado',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Faltan datos requeridos o formato inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error en el servidor o credenciales SMTP inválidas',
  })
  async sendEmail(@Body() dto: SendEmailDto) {
    const user = await this.userService.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    try {
      await this.emailService.send({
        to: user.email,
        subject: dto.subject,
        html: dto.html,
      });

      return {
        success: true,
        message: 'Correo enviado',
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message || 'Error procesando el envío de correo',
      );
    }
  }
}

@ApiTags('Marketing')
@Controller('marketing')
export class MarketingEmailController {
  constructor(
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Obtener membresías disponibles para campañas de marketing.
   * Migrado de Express: GET /api/marketing/memberships
   */
  @Get('memberships')
  @ApiOperation({
    summary: 'Obtener membresías disponibles para campañas de marketing',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de membresías disponibles',
  })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async getMarketingMemberships() {
    return this.userService.getAllMemberships();
  }

  /**
   * Enviar correo de marketing (individual o masivo).
   * Migrado de Express: POST /api/marketing/send
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar correo de marketing (individual o masivo)',
  })
  @ApiResponse({
    status: 200,
    description: 'Correo o correos enviados correctamente',
    schema: {
      example: {
        message: 'Correo de marketing enviado correctamente.',
        sent: 1,
        membershipName: 'Gold',
        email: 'cliente@correo.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o faltantes',
  })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async sendMarketing(@Body() dto: SendMarketingEmailDto) {
    if (!dto.membershipId && !dto.email) {
      throw new BadRequestException('Debes enviar membershipId o email.');
    }

    const memberships = await this.userService.getAllMemberships();
    const targetMembership = dto.membershipId
      ? memberships.find((m) => m.id === dto.membershipId)
      : memberships[0];

    const membershipName = targetMembership?.name || 'Clásica';
    const benefits = targetMembership?.description || 'Beneficios exclusivos';

    if (dto.email) {
      await this.emailService.marketingEmails(
        dto.email,
        'Usuario',
        membershipName,
        benefits,
      );

      return {
        message: 'Correo de marketing enviado correctamente.',
        sent: 1,
        membershipName,
        email: dto.email,
      };
    }

    // Masivo a todos los usuarios
    const users = await this.userService.findAll();
    let sentCount = 0;
    for (const u of users) {
      if (u.notificationPreference) {
        await this.emailService.marketingEmails(
          u.email,
          u.name,
          membershipName,
          benefits,
        );
        sentCount++;
      }
    }

    return {
      message: 'Correos de marketing enviados correctamente.',
      sent: sentCount,
      membershipName,
    };
  }
}
