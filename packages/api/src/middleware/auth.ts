import type { Context, Next } from 'hono';
import { verifyToken } from '@clerk/backend';
import { env } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth');

interface AuthPayload {
  userId: string;
  sessionId: string;
}

/**
 * Clerk JWT authentication middleware.
 * When CLERK_SECRET_KEY is not configured, auth is skipped (local dev mode).
 */
export async function clerkAuth(c: Context, next: Next) {
  if (!env.CLERK_SECRET_KEY) {
    // Auth not configured — local dev mode
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(
      { success: false, error: 'Authorization header required' },
      401,
    );
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      jwtKey: env.CLERK_JWT_KEY,
    });

    const auth: AuthPayload = {
      userId: payload.sub,
      sessionId: payload.sid ?? '',
    };

    c.set('auth', auth);
    return next();
  } catch (err) {
    logger.warn('JWT verification failed', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
}

/**
 * Helper to get auth payload from context. Returns undefined in local dev mode.
 */
export function getAuth(c: Context): AuthPayload | undefined {
  try {
    return c.get('auth') as AuthPayload | undefined;
  } catch {
    return undefined;
  }
}
