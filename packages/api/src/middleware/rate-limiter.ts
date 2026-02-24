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
    // Use forwarded IP, direct IP, or generate a per-request key from headers.
    // Never share a single bucket across all unidentified traffic.
    const forwarded = c.req.header('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = c.req.header('x-real-ip');
    if (realIp) return realIp;
    // Fallback: hash available headers to create a semi-unique key
    const ua = c.req.header('user-agent') ?? '';
    const accept = c.req.header('accept') ?? '';
    return `anon:${ua}:${accept}`;
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
