import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpExceptionResponse } from 'common/interfaces';

export class HttpExceptionDto implements HttpExceptionResponse {
  @ApiProperty({ example: '2022-07-25T17:24:07.042Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/foo/bar' })
  path: string;

  @ApiProperty()
  error: string;

  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  statusCode: number;

  @ApiProperty({ example: 'Something went wrong' })
  message = 'Something went wrong';

  @ApiPropertyOptional({ example: null })
  data?: any;
}

export class ForbiddenExceptionDto extends HttpExceptionDto {
  @ApiProperty({ example: HttpStatus.FORBIDDEN })
  statusCode: number = HttpStatus.FORBIDDEN;

  @ApiProperty({ example: 'Forbidden' })
  message = 'Forbidden';
}

export class UnauthorizedExceptionDto extends HttpExceptionDto {
  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  statusCode: number = HttpStatus.UNAUTHORIZED;

  @ApiProperty({ example: 'Unauthorized' })
  message = 'Unauthorized';
}

export class NotFoundExceptionDto extends HttpExceptionDto {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number = HttpStatus.NOT_FOUND;

  @ApiProperty({ example: 'Not found' })
  message = 'Not found';
}

export class BadRequestExceptionDto extends HttpExceptionDto {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: number = HttpStatus.BAD_REQUEST;

  @ApiProperty({ example: 'Bad Request' })
  message = 'Bad Request';
}

export class TooManyRequestsExceptionDto extends HttpExceptionDto {
  @ApiProperty({ example: HttpStatus.TOO_MANY_REQUESTS })
  statusCode: number = HttpStatus.TOO_MANY_REQUESTS;

  @ApiProperty({ example: 'Too many requests' })
  message = 'Too many requests';
}
