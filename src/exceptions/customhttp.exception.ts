import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  readonly statusCode: string;

  constructor(message: string, status: HttpStatus, statusCode: string) {
    super(message, status);
    this.statusCode = statusCode;
  }
}
