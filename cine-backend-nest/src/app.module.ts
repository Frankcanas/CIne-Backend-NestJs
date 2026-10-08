import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { LocationModule } from './location/location.module.js';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { EmailModule } from './email/email.module.js';
import { MovieModule } from './movie/movie.module.js';
import { ProductModule } from './product/product.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeEnabled =
  Boolean(process.env.OBSERVE_APP_KEY) &&
  Boolean(process.env.OBSERVE_APP_SECRET);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),

    ...(observeEnabled
      ? [
          ObserveModule.forRoot({
            appKey: process.env.OBSERVE_APP_KEY!,
            appSecret: process.env.OBSERVE_APP_SECRET!,
            serviceId: 'cine-backend-nest',
          }),
        ]
      : []),

    LocationModule,
    UserModule,
    AuthModule,
    EmailModule,
    MovieModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}