import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): any {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    response.setHeader('Cache-Control', 'private,no-cache,no-store');
    return next.handle();
  }
}
