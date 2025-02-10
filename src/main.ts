import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomHttpExceptionFilter } from './exceptions/custom.filter-exception';

/**
 * Fonction principale pour démarrer l'application NestJS
 * @returns Promise<void> - Démarrage de l'application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /**
   * Utilisation des pipes de validation global
   * @constant
   * @type {Object}
   * @property {Object} ValidationPipe - Pipe de validation
   */
  app.useGlobalPipes(new ValidationPipe());
  /**
   * Utilisation des filtres de gestion des exceptions global
   * @constant
   * @type {Object}
   * @property {Object} CustomHttpExceptionFilter - Filtre de gestion des exceptions
   */
  app.useGlobalFilters(new CustomHttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
