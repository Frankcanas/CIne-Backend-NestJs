import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    constructor (
        private readonly emailService: MailerService
    ) {}

    async sendVerificationEmail(to: string, token: string): Promise<void> {
    await this.emailService.sendMail({
      from: `"Riwi-Cine" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Código de verificación de seguridad',
      text: `Tu código de verificación es: ${token}. Expira en 15 minutos.`,
      html: `<p>Tu código de verificación es: <b>${token}</b>.</p><p>Expira en 15 minutos.</p>`,
        })
    }

    async sendUserCreationEmail(to: string): Promise<void> {
        await this.emailService.sendMail({
      from: `"Riwi-Cine" <${process.env.SMTP_USER}>`,
      to,
      subject: '¡Bienvenido a Riwi Cine!',
      text: 'Bienvenido(a) a Riwi Cine! Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión y disfrutar de todas nuestras funciones.',
      html: `
        <p>¡Bienvenido(a) a Riwi Cine!</p>
        <p>Tu cuenta ha sido creada correctamente.</p>
        <p>Ahora puedes iniciar sesión y disfrutar de todas nuestras funciones.</p>
      `,
        })
    }


    async passwordRecoveryEmail(to: string, token: string): Promise<void> {
        await this.emailService.sendMail ({
      from: `"Riwi-Cine" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Recuperación de contraseña',
      text: `Tu token para recuperar la contraseña es: ${token}. Expira en 15 minutos.`,
      html: `
        <p>Recuperación de contraseña</p>
        <p>Tu token para recuperar la contraseña es: <b>${token}</b>.</p>
        <p>Expira en 15 minutos.</p>
      `,
        })
    }

    async marketingEmails(to: string, user: string, membership: string, membershipBenefits: string): Promise<void> {
        await this.emailService.sendMail ({
      from: `"Riwi-Cine" <${process.env.SMTP_USER}>`,
      to,
      subject: `Conoce los beneficios de nuestra membresía ${membership}`,
      text: `Hola ${user}, ¿ya conocías los beneficios de nuestra membresía ${membership}?`,
      html: `
        <div>
          <p>Hola <strong>${user}</strong>,</p>
          <p>¿Ya conocías los beneficios de nuestra membresía <strong>${membership}</strong>?</p>
          <p>${membershipBenefits}</p>
        </div>
      `,
        })
    }
}
