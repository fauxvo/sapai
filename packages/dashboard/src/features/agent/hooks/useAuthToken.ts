import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Returns a function that retrieves the current auth token.
 * When Clerk is not configured, returns a no-op that yields undefined.
 *
 * Note: clerkEnabled is a build-time constant (import.meta.env), so the
 * conditional hook call order is stable across renders.
 */
export function useAuthToken(): () => Promise<string | undefined> {
  // Both hooks are always called; the Clerk hook is a no-op wrapper when disabled
  const clerkAuth = clerkEnabled ? useAuth() : null;

  return useCallback(async () => {
    if (!clerkAuth) return undefined;
    const token = await clerkAuth.getToken();
    return token ?? undefined;
  }, [clerkAuth]);
}
