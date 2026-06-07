/**
 * In-Memory Sliding Window Rate Limiter for Supabase Edge Functions.
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { windowMs: 60000, maxRequests: 20 }) {
    this.config = config;
  }

  /**
   * Checks if the request limit has been exceeded for the given identifier.
   * Returns true if rate limit is exceeded, false otherwise.
   */
  public isLimitExceeded(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Filter out timestamps outside the sliding window
    const windowStart = now - this.config.windowMs;
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    
    if (validTimestamps.length >= this.config.maxRequests) {
      this.requests.set(key, validTimestamps);
      return true;
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return false;
  }

  /**
   * Cleanup method to remove old entries from the map to prevent memory leaks.
   */
  public cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    for (const [key, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter(ts => ts > windowStart);
      if (valid.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, valid);
      }
    }
  }
}

const getEnv = (name: string): string | undefined => {
  if (typeof Deno !== 'undefined') {
    return Deno.env.get(name);
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  return undefined;
};

// Instantiate standard chat rate limiter
export const chatRateLimiter = new SlidingWindowRateLimiter({
  windowMs: Number(getEnv('RATE_LIMIT_WINDOW_MS') || '60000'), // default 1 minute
  maxRequests: Number(getEnv('RATE_LIMIT_MAX_REQUESTS') || '20') // default 20 requests
});

// Periodic cleanup of rate limiting memory every 5 minutes
setInterval(() => {
  chatRateLimiter.cleanup();
}, 300000);
