import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  readonly statusCode: string;

  /**
   * Constructeur de la classe CustomHttpException
   * @param message - Message de l'exception
   * @param status - Statut HTTP de l'exception
   * @param statusCode - Code de statut de l'exception
   */
  constructor(message: string, status: HttpStatus, statusCode: string) {
    super(message, status);
    this.statusCode = statusCode;
  }
}
