import { createClient } from "@redis/client";

const redis = createClient({
  url: process.env.REDIS_URL
});

async function ensureRedisConnected(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function consumeToken({
  identifier,
  tokens = 1,
  maxTokens,
  refillRatePerSec
}: {
  identifier: string;
  tokens?: number;
  maxTokens: number;
  refillRatePerSec: number;
}): Promise<boolean> {
  await ensureRedisConnected();
  const key = `ratelimit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const script = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local tokens = tonumber(ARGV[2])
    local maxTokens = tonumber(ARGV[3])
    local refillRate = tonumber(ARGV[4])
    local bucket = redis.call('HMGET', key, 'tokens', 'timestamp')
    local currentTokens = bucket[1]
    local lastRefill = bucket[2]
    if currentTokens == false then
      currentTokens = maxTokens
      lastRefill = now
    else
      currentTokens = tonumber(currentTokens)
      lastRefill = tonumber(lastRefill)
    end
    local delta = now - lastRefill
    local filled = math.min(maxTokens, currentTokens + delta * refillRate)
    if filled < tokens then
      redis.call('HMSET', key, 'tokens', filled, 'timestamp', now)
      redis.call('EXPIRE', key, math.ceil(maxTokens / refillRate))
      return -1
    end
    local remaining = filled - tokens
    redis.call('HMSET', key, 'tokens', remaining, 'timestamp', now)
    redis.call('EXPIRE', key, math.ceil(maxTokens / refillRate))
    return remaining
  `;

  const result = Number(
    await redis.eval(script, {
      keys: [key],
      arguments: [now.toString(), tokens.toString(), maxTokens.toString(), refillRatePerSec.toString()]
    })
  );

  return result >= 0;
}
