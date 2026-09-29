import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Mensaje de bienvenida del backend' })
  @ApiResponse({ status: 200, description: 'Mensaje de saludo' })
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Verificar el estado de salud de la API.
   * Migrado de Express: GET /api/v1/health y GET /api/health
   */
  @Get(['health', 'v1/health'])
  @ApiTags('Health')
  @ApiOperation({ summary: 'Verificar el estado de salud de la API' })
  @ApiResponse({
    status: 200,
    description: 'El servicio está operando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 123.45 },
      },
    },
  })
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
  @Get('health')
healthCheck() {
  return {
    status: 'ok',
  };
}
}

