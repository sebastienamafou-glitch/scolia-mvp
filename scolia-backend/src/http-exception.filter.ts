// scolia-backend/src/http-exception.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    // 🚨 LOGGING AMÉLIORÉ 🚨
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
       // Si c'est un crash (500), on veut voir la ligne de code exacte
       this.logger.error(
         `❌ CRASH CRITIQUE sur ${request.method} ${request.url}`,
         exception instanceof Error ? exception.stack : String(exception) // Affiche la stack trace
       );
    } else {
       // Si c'est une erreur métier gérée (400, 401, 403...), on log juste le message
       this.logger.warn(
         `⚠️ Erreur ${status} sur ${request.url}: ${JSON.stringify(errorResponse)}`
       );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorResponse,
    });
  }
}
