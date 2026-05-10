import { Redis } from '@upstash/redis';

const PREFIX = 'mayra:catalogue:';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7;

let client: Redis | null = null;
let initialized = false;

const getClient = (): Redis | null => {
  if (initialized) return client;
  initialized = true;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  try {
    client = Redis.fromEnv();
  } catch (e) {
    console.error('[cache] failed to init Upstash client', e);
    client = null;
  }
  return client;
};

export const cacheRead = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<T | null> => {
  const redis = getClient();
  const fullKey = `${PREFIX}${key}`;

  try {
    const fresh = await fetcher();
    if (redis && fresh !== undefined && fresh !== null) {
      redis.set(fullKey, fresh as unknown, { ex: ttlSeconds }).catch((e) => {
        console.error(`[cache] write failed for ${fullKey}`, e);
      });
    }
    return fresh;
  } catch (fetchErr) {
    console.error(`[cache] fetcher failed for ${fullKey}, attempting fallback`, fetchErr);
    if (!redis) return null;
    try {
      const stale = await redis.get<T>(fullKey);
      if (stale !== null && stale !== undefined) {
        console.warn(`[cache] serving stale value for ${fullKey}`);
        return stale;
      }
    } catch (cacheErr) {
      console.error(`[cache] read failed for ${fullKey}`, cacheErr);
    }
    return null;
  }
};

export const cacheInvalidate = async (key: string): Promise<void> => {
  const redis = getClient();
  if (!redis) return;
  try {
    await redis.del(`${PREFIX}${key}`);
  } catch (e) {
    console.error(`[cache] invalidate failed for ${key}`, e);
  }
};
