import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Đã xảy ra lỗi trên hệ thống.';
    let errorName = 'Internal Server Error';
    let errors: Record<string, string[]> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorName = exception.name.replace(/Exception$/, '');
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;

        // 1. Resolve message
        if (typeof resObj.message === 'string') {
          message = resObj.message;
        } else if (Array.isArray(resObj.message) && resObj.message.length > 0) {
          message = String(resObj.message[0]);
        } else if (typeof resObj.error === 'string') {
          message = resObj.error;
        }

        // 2. Resolve field errors
        if (resObj.errors && typeof resObj.errors === 'object' && !Array.isArray(resObj.errors)) {
          errors = resObj.errors as Record<string, string[]>;
        } else if (resObj.field && typeof resObj.field === 'string') {
          errors = { [resObj.field]: [message] };
        } else if (Array.isArray(resObj.message)) {
          errors = { _global: resObj.message as string[] };
        }
      }
    } else {
      this.logger.error('Unhandled Exception:', exception);
    }

    const payload: ApiErrorResponse = {
      statusCode: status,
      message,
      error: errorName,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(payload);
  }
}
