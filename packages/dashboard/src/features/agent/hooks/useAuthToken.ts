import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Returns a function that retrieves the current auth token.
 * When Clerk is not configured, returns a no-op that yields undefined.
 */
export function useAuthToken(): () => Promise<string | undefined> {
  if (!clerkEnabled) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCallback(async () => undefined, []);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { getToken } = useAuth();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useCallback(async () => {
    const token = await getToken();
    return token ?? undefined;
  }, [getToken]);
}
