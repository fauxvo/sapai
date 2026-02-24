import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AgentParseResponse } from '@sapai/shared';
import { useAuthToken } from './useAuthToken';

type PipelineStage =
  | 'parsing'
  | 'validating'
  | 'resolving'
  | 'planning'
  | 'executing';

interface StageState {
  currentStage: PipelineStage | null;
  completedStages: PipelineStage[];
  error: string | null;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export function useParseStream() {
  const [stages, setStages] = useState<StageState>({
    currentStage: null,
    completedStages: [],
    error: null,
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const getToken = useAuthToken();
  const queryClient = useQueryClient();

  const stream = useCallback(
    async (params: {
      message: string;
      conversationId?: string;
    }): Promise<
      | (AgentParseResponse & { executionResult?: unknown })
      | null
    > => {
      // Reset state
      setStages({ currentStage: null, completedStages: [], error: null });
      setIsStreaming(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const token = await getToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE}/agent/parse/stream`, {
          method: 'POST',
          headers,
          body: JSON.stringify(params),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Stream failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalResult: (AgentParseResponse & { executionResult?: unknown }) | null = null;
        let currentEventType = '';

        while (true) {
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
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);

                if (currentEventType === 'stage') {
                  setStages((prev) => {
                    if (parsed.status === 'started') {
                      return {
                        ...prev,
                        currentStage: parsed.stage,
                        error: null,
                      };
                    }
                    if (parsed.status === 'completed') {
                      return {
                        ...prev,
                        currentStage: null,
                        completedStages: [
                          ...prev.completedStages,
                          parsed.stage,
                        ],
                      };
                    }
                    if (parsed.status === 'error') {
                      return { ...prev, error: parsed.data ?? 'Stage error' };
                    }
                    return prev;
                  });
                } else if (currentEventType === 'result') {
                  finalResult = {
                    conversationId: parsed.conversationId,
                    messageId: parsed.messageId,
                    parseResult: parsed.parseResult,
                    plan: parsed.plan,
                    executionResult: parsed.result,
                    clarification: parsed.clarification,
                  };
                } else if (currentEventType === 'error') {
                  setStages((prev) => ({
                    ...prev,
                    error: parsed.message ?? 'Pipeline error',
                  }));
                }

                currentEventType = '';
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }

        // Invalidate queries after stream completes
        if (finalResult) {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          if (params.conversationId || finalResult.conversationId) {
            queryClient.invalidateQueries({
              queryKey: [
                'conversation',
                params.conversationId ?? finalResult.conversationId,
              ],
            });
          }
        }

        return finalResult;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return null;
        setStages((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Stream error',
        }));
        throw err;
      } finally {
        setIsStreaming(false);
      }
    },
    [getToken, queryClient],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    stream,
    cancel,
    isStreaming,
    stages,
  };
}
