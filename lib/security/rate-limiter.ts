import { redis } from '@/lib/security/redis';

export async function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  const redisKey = `ratelimit:${key}`;
  const tx = redis.multi();
  tx.incr(redisKey);
  tx.expire(redisKey, windowSeconds, 'NX');
  const [count] = (await tx.exec()) ?? [];
  const usage = typeof count === 'number' ? count : Number(count?.[1]) ?? 0;
  if (usage > limit) {
    return { allowed: false, remaining: 0 } as const;
  }
  return { allowed: true, remaining: Math.max(limit - usage, 0) } as const;
}
