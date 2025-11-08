import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only initialize Redis if environment variables are present
let redis: Redis | null = null;
let loginRatelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Rate limit for login attempts: 5 attempts per 10 minutes per IP
  loginRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: true,
    prefix: "ratelimit:login",
  });
}

/**
 * Check if login rate limit is exceeded for a given IP address
 * @param ip - IP address to check
 * @returns Object with success flag and remaining attempts
 */
export async function checkLoginRateLimit(ip: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If Redis is not configured, allow the request (fail open)
  if (!loginRatelimit) {
    console.warn("Rate limiting is not configured. Upstash Redis credentials missing.");
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  const result = await loginRatelimit.limit(ip);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export { loginRatelimit };
