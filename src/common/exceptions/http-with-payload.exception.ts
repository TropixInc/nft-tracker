import { HttpException } from '@nestjs/common';

export class HttpWithPayloadException extends HttpException {
  constructor(httpException: HttpException, payload: any) {
    const response = HttpWithPayloadException.makeCustomResponse(httpException.getResponse(), payload);
    super(response, httpException.getStatus());
  }

  private static makeCustomResponse(baseResponse: string | Record<string, any>, payload: any): object {
    let customResponse = {
      data: payload,
    };

    if (typeof baseResponse === 'object') {
      customResponse = {
        ...baseResponse,
        ...customResponse,
      };
    }

    return customResponse;
  }
}
