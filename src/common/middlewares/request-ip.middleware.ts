import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { CustomRequest } from 'common/interfaces';
import { NextFunction, Response } from 'express';
import * as requestIp from 'request-ip';

@Injectable()
export class RequestIpMiddleware implements NestMiddleware {
  private logger = new Logger(RequestIpMiddleware.name);

  async use(req: CustomRequest, _res: Response, next: NextFunction) {
    const clientIp = requestIp.getClientIp(req);
    if (clientIp) {
      req.clientIp = clientIp;
    }

    next();
  }
}
