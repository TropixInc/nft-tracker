import { SecondsTTL } from 'src/common/enums';
import { applyDecorators, UseInterceptors, Header } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

export function CdnCache(ttl: SecondsTTL) {
  return applyDecorators(
    UseInterceptors(CacheInterceptor),
    CacheTTL(ttl),
    Header('Cache-Control', `public, max-age=${ttl}`),
  );
}
