import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiResponseMetadata, ApiResponseOptions } from '@nestjs/swagger';

export type ResponseType = ApiResponseMetadata['type'];

export type Options = ApiResponseOptions & { status: HttpStatus };

export function TypedResponse(type: ResponseType, options: Options) {
  const decorators = [HttpCode(options.status), ApiResponse({ ...options, type })];

  return applyDecorators(...decorators);
}
