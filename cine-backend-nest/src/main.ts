import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Prefijo global /api replicando las rutas de Express
  app.setGlobalPrefix('api');

  // CORS habilitado para comunicación con Frontend y Swagger
  app.enableCors();

  // Validación automática de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de OpenAPI / Swagger en /api/docs
  const config = new DocumentBuilder()
    .setTitle('Cine Backend API')
    .setDescription('API de Cine Backend migrada a NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Locations', 'Endpoints para consultar países y ciudades')
    .addTag('Users', 'Endpoints para gestión de usuarios, perfiles y membresías')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
await bootstrap();
