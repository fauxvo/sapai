import type { Context, Next } from 'hono';
import { env } from '../config/environment.js';

/**
 * Returns 503 when ANTHROPIC_API_KEY is not set.
 * Apply to routes that require the AI service (parse, stream, execute).
 */
export async function anthropicGuard(c: Context, next: Next) {
  if (!env.ANTHROPIC_API_KEY) {
    return c.json(
      {
        success: false,
        error:
          'AI agent service is not configured. Set ANTHROPIC_API_KEY to enable.',
      },
      503,
    );
  }
  return next();
}
