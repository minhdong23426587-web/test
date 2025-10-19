import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  enableAutoPipelining: true,
  maxRetriesPerRequest: 2,
  tls: REDIS_URL.startsWith('rediss://') ? {} : undefined
});

export const redisSubscriber = new Redis(REDIS_URL);
export const redisPublisher = new Redis(REDIS_URL);
