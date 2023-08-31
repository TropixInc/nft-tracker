import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { HttpExceptionResponse } from 'common/interfaces';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const result: any = exception instanceof HttpException ? exception.getResponse() : exception;

    if (request.url.includes('/health')) {
      return response.status(status).json(result);
    }

    if (exception.name === 'EntityNotFoundError') {
      const type = exception.message.split(' matching: ')[0].replace(/"/g, '').trim();
      const data: HttpExceptionResponse = {
        timestamp: new Date().toISOString(),
        path: decodeURIComponent(request.url),
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
        message: `Could not find any entity of type ${type}`,
      };

      return response.status(HttpStatus.NOT_FOUND).json(data);
    }

    // Could not find any entity of type
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const error = HttpStatus[status] || 'Server Error';
      const data: HttpExceptionResponse = {
        timestamp: new Date().toISOString(),
        path: decodeURIComponent(request.url),
        error,
        statusCode: status,
        message: error,
      };

      this.logger.error(this.extractAxiosErrorMessage(exception), exception.stack);
      return response.status(status).json(data);
    }

    const data: HttpExceptionResponse = {
      timestamp: new Date().toISOString(),
      path: decodeURIComponent(request.url),
      error: result?.error || result?.message || status.toString(),
      statusCode: status,
      message: typeof result === 'string' ? result : result.message,
    };

    if (result?.data) {
      data.data = result.data;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(data, exception.stack);
    }

    response.status(status).json(data);
  }

  private extractAxiosErrorMessage(error: Error): string {
    if (!(error as AxiosError).isAxiosError) {
      return error.message;
    }

    const axiosError = error as AxiosError;
    const axiosInfo = {
      baseURL: axiosError.config?.baseURL,
      url: axiosError.config?.url,
      fullUrl:
        axiosError.config?.url && axiosError.config?.baseURL
          ? `${axiosError.config?.baseURL}${axiosError.config?.url}`
          : undefined,
      method: axiosError.config?.method,
      status: axiosError.response?.status,
    };

    return `${axiosError.message} - ${axiosInfo.method} ${axiosInfo.fullUrl}`;
  }
}
