import { useQuery } from '@tanstack/react-query';

export interface SapHealthStatus {
  status: 'connected' | 'degraded' | 'error';
  authenticated: boolean | null;
  responseTimeMs?: number;
  message?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const VALID_STATUSES = new Set<SapHealthStatus['status']>([
  'connected',
  'degraded',
  'error',
]);

async function fetchSapHealth(): Promise<SapHealthStatus> {
  const res = await fetch(`${API_BASE}/sap/health`);
  // Both 200 and 503 return valid JSON — don't throw on 503
  const json = await res.json();
  if (!json || !VALID_STATUSES.has(json.status)) {
    return { status: 'error', authenticated: null, message: 'Unexpected response' };
  }
  return json as SapHealthStatus;
}

/**
 * Polls the SAP health endpoint with adaptive intervals.
 * - Connected: every 60s (SAP is stable, no need to hammer it)
 * - Down/degraded: every 15s (user is waiting for it to come back)
 * - Pauses automatically when the browser tab is not focused.
 */
export function useSapHealth() {
  return useQuery({
    queryKey: ['sap-health'],
    queryFn: fetchSapHealth,
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
