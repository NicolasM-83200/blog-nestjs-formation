import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHttpException } from './customhttp.exception';

/**
 * Filtre personnalisé pour gérer les exceptions de type CustomHttpException
 * @Catch(CustomHttpException)
 * @export
 * @implements {ExceptionFilter}
 */

@Catch(CustomHttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  catch(exception: CustomHttpException, host: ArgumentsHost) {
    // Récupération du contexte de l'exception
    const ctx = host.switchToHttp();
    // Récupération de la réponse
    const response = ctx.getResponse<Response>();
    // Récupération de la requête
    const request = ctx.getRequest<Request>();
    // Récupération du statut de l'exception
    const status = exception.getStatus();

    response.status(status).json({
      message: exception.message,
      statusCode: exception.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
