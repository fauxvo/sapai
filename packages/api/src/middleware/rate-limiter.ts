import { rateLimiter } from 'hono-rate-limiter';
import type { Context } from 'hono';
import { env } from '../config/environment.js';
import { getAuth } from './auth.js';

/**
 * Rate limiter for AI agent endpoints.
 * Uses userId from auth context when available, falls back to IP.
 */
export const agentRateLimiter = rateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  keyGenerator: (c: Context) => {
    const auth = getAuth(c);
    if (auth?.userId) return auth.userId;
    return (
      c.req.header('x-forwarded-for') ??
      c.req.header('x-real-ip') ??
      'unknown'
    );
  },
  handler: (c: Context) => {
    const retryAfter = Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000);
    return c.json(
      {
        success: false,
        error: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      429,
      { 'Retry-After': String(retryAfter) },
    );
  },
});
