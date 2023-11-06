import { Cache } from 'cache-manager';
import { isDefined } from 'class-validator';

/**
 * Try to resolve cache first, then call the callback function to warm cache.
 * @param cacheManager
 * @param cacheKey
 * @param callback
 * @param options
 * @returns
 */
export const cacheResolver = async <T = any>(
  cacheManager: Cache,
  cacheKey: string,
  callback: () => Promise<T>,
  options: {
    ttl?: number;
    ttlResolver?: (result: T) => number;
    checker?: (result: T) => boolean;
    force?: boolean;
    asyncCaching?: boolean;
  } = { force: false, asyncCaching: true },
): Promise<T> => {
  // Short circuit to prevent cache access.
  if (!options.force) {
    const cached = await cacheManager.get<T>(cacheKey);

    if (isDefined(cached)) {
      return cached!;
    }
  }

  const result = await callback();
  const shouldCache = options?.checker ? options.checker(result) : isDefined(result);

  if (shouldCache) {
    const ttl = options.ttlResolver ? options.ttlResolver(result) : options.ttl;
    const setCachePromise = cacheManager.set(cacheKey, result, { ttl: ttl ? ttl : undefined } as any);
    if (!options.asyncCaching) {
      await setCachePromise;
    }
  }
  return result;
};
