import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create rate limiter instance
// Falls back to in-memory if Redis not configured (dev only)
let ratelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests per 10 seconds
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  }
} catch (error) {
  console.error("Failed to initialize rate limiter:", error);
}

// In-memory fallback for development
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(identifier: string, limit = 5, windowMs = 10000): { success: boolean } {
  const now = Date.now();
  const record = memoryStore.get(identifier);

  if (!record || now > record.resetAt) {
    // New window
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false };
  }

  record.count++;
  return { success: true };
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  if (ratelimit) {
    const result = await ratelimit.limit(identifier);
    return { success: result.success };
  }

  // Fallback to in-memory for development
  return inMemoryRateLimit(identifier);
}

// More aggressive rate limiting for auth endpoints
let authRatelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    authRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "60 s"), // 3 attempts per minute
      analytics: true,
      prefix: "@upstash/ratelimit/auth",
    });
  }
} catch (error) {
  console.error("Failed to initialize auth rate limiter:", error);
}

export async function checkAuthRateLimit(identifier: string): Promise<{ success: boolean }> {
  if (authRatelimit) {
    const result = await authRatelimit.limit(identifier);
    return { success: result.success };
  }

  // Fallback to in-memory: 3 attempts per minute
  return inMemoryRateLimit(identifier, 3, 60000);
}
