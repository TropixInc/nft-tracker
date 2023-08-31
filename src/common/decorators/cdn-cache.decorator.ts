import { SecondsTTL } from 'src/common/enums';
import { applyDecorators, UseInterceptors, CacheInterceptor, CacheTTL, Header } from '@nestjs/common';

export function CdnCache(ttl: SecondsTTL) {
  return applyDecorators(
    UseInterceptors(CacheInterceptor),
    CacheTTL(ttl),
    Header('Cache-Control', `public, max-age=${ttl}`),
  );
}
