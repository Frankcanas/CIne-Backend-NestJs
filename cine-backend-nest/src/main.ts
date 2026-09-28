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

  // Configuración de OpenAPI / Swagger en /api/docs replicada de Express (Riwi Cine API)
  const config = new DocumentBuilder()
    .setTitle('Riwi Cine API')
    .setDescription('API de gestión del sistema Multicine.')
    .setVersion('1.0.0')
    .addServer('/', 'Servidor actual (relativo)')
    .addServer('http://localhost:3000', 'Servidor local (localhost:3000)')
    .addServer('http://127.0.0.1:3000', 'Servidor IP local (127.0.0.1:3000)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingrese el token JWT en el formato: Bearer <token>',
        in: 'header',
      },
      'bearerAuth',
    )
    .addTag(
      'Autenticación',
      'Endpoints de inicio de sesión, refresh token, recuperación de contraseña y verificación',
    )
    .addTag(
      'Users',
      'Endpoints para gestión de usuarios, perfiles y estado de membresía',
    )
    .addTag(
      'Locations',
      'Endpoints para consultar países, ciudades y ubicación preferida',
    )
    .addTag(
      'Membership',
      'Endpoints para catálogo, consulta y creación de membresías y beneficios',
    )
    .addTag('Mail', 'Endpoints para envío de correos directos a usuarios')
    .addTag(
      'Marketing',
      'Endpoints para campañas de correo y promociones de membresías',
    )
    .addTag(
      'Movies - TMDB',
      'Endpoints para consultar catálogo externo, estrenos, populares y búsqueda en The Movie Database (TMDB)',
    )
    .addTag(
      'Movies',
      'Endpoints para gestión del catálogo de películas locales, recomendaciones y cartelera',
    )
    .addTag('Health', 'Verificación del estado de salud de la API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Riwi Cine API - Swagger Docs',
  });

  // Endpoint para exponer la especificación OpenAPI en JSON (igual que Express /api-docs.json)
  app.getHttpAdapter().get('/api/docs-json', (_req, res) => {
    res.json(document);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}
await bootstrap();
