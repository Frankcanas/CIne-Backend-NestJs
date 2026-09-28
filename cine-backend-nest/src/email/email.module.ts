import { Module, forwardRef } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service.js';
import { EmailController, MarketingEmailController } from './email.controller.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST') || 'smtp.gmail.com',
          port: Number(configService.get('SMTP_PORT')) || 465,
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          },
        },
        defaults: {
          from: configService.get('SMTP_FROM') || 'riwicine@gmail.com',
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule),
  ],
  providers: [EmailService],
  controllers: [EmailController, MarketingEmailController],
  exports: [EmailService],
})
export class EmailModule {}
