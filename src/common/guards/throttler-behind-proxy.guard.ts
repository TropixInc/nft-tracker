import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { CustomRequest } from 'common/interfaces';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: CustomRequest): string {
    return req.clientIp || req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
  }
}
