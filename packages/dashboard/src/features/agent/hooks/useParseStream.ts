import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AgentParseResponse } from '@sapai/shared';
import { useAuthToken } from './useAuthToken';
import type {
  PipelineStage,
  CostEstimate,
  StageDetail,
  ProgressItem,
} from '../types';

export type { CostEstimate, ProgressItem };

interface StageState {
  currentStage: PipelineStage | null;
  completedStages: PipelineStage[];
  stageDetails: StageDetail[];
  progressItems: Record<string, ProgressItem[]>;
  error: string | null;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export function useParseStream() {
  const [stages, setStages] = useState<StageState>({
    currentStage: null,
    completedStages: [],
    stageDetails: [],
    progressItems: {},
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
      setStages({ currentStage: null, completedStages: [], stageDetails: [], progressItems: {}, error: null });
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

        const response = await fetch(`${API_BASE}/api/agent/parse/stream`, {
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
                    const detail = parsed.data?.detail as string | undefined;
                    if (parsed.status === 'started') {
                      const existingDetail = prev.stageDetails.find(d => d.stage === parsed.stage);
                      const updatedDetails = existingDetail
                        ? prev.stageDetails.map(d => d.stage === parsed.stage ? { ...d, startedDetail: detail } : d)
                        : [...prev.stageDetails, { stage: parsed.stage as PipelineStage, startedDetail: detail }];
                      return {
                        ...prev,
                        currentStage: parsed.stage,
                        stageDetails: updatedDetails,
                        error: null,
                      };
                    }
                    if (parsed.status === 'completed') {
                      const cost = parsed.data?.costEstimate as CostEstimate | undefined;
                      const updatedDetails = prev.stageDetails.map(d =>
                        d.stage === parsed.stage ? { ...d, completedDetail: detail, ...(cost ? { costEstimate: cost } : {}) } : d,
                      );
                      return {
                        ...prev,
                        currentStage: null,
                        completedStages: [
                          ...prev.completedStages,
                          parsed.stage,
                        ],
                        stageDetails: updatedDetails,
                      };
                    }
                    if (parsed.status === 'progress') {
                      const d = parsed.data as {
                        item: string;
                        detail: string;
                        index: number;
                        total: number;
                        status: 'running' | 'done' | 'failed';
                      } | undefined;
                      if (d) {
                        const stage = parsed.stage as string;
                        const existing = prev.progressItems[stage] ?? [];
                        const idx = existing.findIndex((p) => p.item === d.item);
                        const updated: ProgressItem = {
                          item: d.item,
                          detail: d.detail,
                          status: d.status,
                        };
                        const newItems =
                          idx >= 0
                            ? existing.map((p, i) => (i === idx ? updated : p))
                            : [...existing, updated];
                        return {
                          ...prev,
                          progressItems: { ...prev.progressItems, [stage]: newItems },
                        };
                      }
                      return prev;
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
