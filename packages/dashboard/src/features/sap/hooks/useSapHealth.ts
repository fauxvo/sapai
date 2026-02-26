import { useQuery } from '@tanstack/react-query';
import { useAuthToken } from '../../agent/hooks/useAuthToken';

export interface SapHealthStatus {
  status: 'connected' | 'degraded' | 'error';
  authenticated: boolean | null;
  responseTimeMs?: number;
  message?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const VALID_STATUSES: ReadonlySet<string> = new Set([
  'connected',
  'degraded',
  'error',
]);

function isSapHealthStatus(json: unknown): json is SapHealthStatus {
  if (typeof json !== 'object' || json === null) return false;
  const obj = json as Record<string, unknown>;
  return (
    typeof obj.status === 'string' &&
    VALID_STATUSES.has(obj.status) &&
    (obj.authenticated === null || typeof obj.authenticated === 'boolean')
  );
}

const ERROR_SENTINEL: SapHealthStatus = {
  status: 'error',
  authenticated: null,
};

async function fetchSapHealth(token?: string): Promise<SapHealthStatus> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/sap/health`, { headers });

  // Auth failures are not SAP status — surface them distinctly.
  // 503 is expected (SAP offline), so only treat 401/403 as auth errors.
  if (res.status === 401 || res.status === 403) {
    return {
      ...ERROR_SENTINEL,
      message: `Authentication failed (${res.status})`,
    };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { ...ERROR_SENTINEL, message: 'Non-JSON response' };
  }
  if (!isSapHealthStatus(json)) {
    return { ...ERROR_SENTINEL, message: 'Unexpected response' };
  }
  return json;
}

/**
 * Polls the SAP health endpoint with adaptive intervals.
 * - Connected: every 60s (SAP is stable, no need to hammer it)
 * - Down/degraded: every 15s (user is waiting for it to come back)
 * - Pauses automatically when the browser tab is not focused.
 */
export function useSapHealth() {
  const getToken = useAuthToken();
  return useQuery({
    queryKey: ['sap-health'],
    queryFn: async () => {
      const t = await getToken();
      return fetchSapHealth(t);
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'connected' ? 60_000 : 15_000;
    },
    // Don't poll when tab is hidden (default, but explicit for clarity)
    refetchIntervalInBackground: false,
    staleTime: 10_000,
    retry: 1,
  });
}
