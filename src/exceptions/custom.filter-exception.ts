import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHttpException } from './customhttp.exception';
@Catch(CustomHttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  catch(exception: CustomHttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      message: exception.message,
      statusCode: exception.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
