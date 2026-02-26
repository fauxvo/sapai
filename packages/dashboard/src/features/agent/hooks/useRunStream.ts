import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthToken } from './useAuthToken';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * SSE hook for live pipeline run updates.
 *
 * Connects to GET /api/agent/runs/:id/stream when runId is set and enabled.
 * On receiving 'stage' or 'complete' events, invalidates the React Query cache
 * so that useRun() refetches fresh data from the server.
 */
export function useRunStream(runId: string | null, enabled: boolean = true) {
  const [isConnected, setIsConnected] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const getToken = useAuthToken();
  const queryClient = useQueryClient();

  // Store callbacks in refs to avoid effect re-runs (Golden Rule #9)
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  const invalidate = useCallback((id: string) => {
    queryClientRef.current.invalidateQueries({ queryKey: ['run', id] });
    queryClientRef.current.invalidateQueries({ queryKey: ['runs'] });
  }, []);

  useEffect(() => {
    if (!runId || !enabled) {
      setIsConnected(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    let active = true;

    async function connect() {
      try {
        const token = await getTokenRef.current();
        const headers: Record<string, string> = {
          Accept: 'text/event-stream',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(
          `${API_BASE}/api/agent/runs/${runId}/stream`,
          {
            headers,
            signal: controller.signal,
          },
        );

        if (!response.ok || !response.body) {
          if (active) setIsConnected(false);
          return;
        }

        if (active) setIsConnected(true);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEventType = '';

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEventType = line.slice(7).trim();
              continue;
            }
            if (line.startsWith('data: ')) {
              if (
                currentEventType === 'stage' ||
                currentEventType === 'progress'
              ) {
                // Stage update: invalidate to refetch fresh data
                invalidate(runId!);
              } else if (currentEventType === 'complete') {
                // Run complete: invalidate and we'll disconnect via
                // the enabled flag changing to false
                invalidate(runId!);
              } else if (currentEventType === 'error') {
                invalidate(runId!);
              }
              currentEventType = '';
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        // Connection failed or dropped — not critical since useRun()
        // polls as a fallback
      } finally {
        if (active) setIsConnected(false);
      }
    }

    connect();

    return () => {
      active = false;
      controller.abort();
      abortRef.current = null;
    };
  }, [runId, enabled, invalidate]);

  return { isConnected };
}
