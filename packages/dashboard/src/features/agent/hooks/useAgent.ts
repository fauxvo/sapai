import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  parseMessage,
  executePlan,
  listConversations,
  getConversation,
  createConversation,
} from '../api';
import type { AgentParseRequest, AgentExecuteRequest } from '@sapai/shared';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => listConversations({ status: 'active', limit: 50 }),
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversation(id!),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useParse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AgentParseRequest) => parseMessage(body),
    onSuccess: (_data, variables) => {
      if (variables.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['conversation', variables.conversationId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useExecute(conversationId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AgentExecuteRequest) => executePlan(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['conversation', conversationId],
        });
      }
    },
  });
}
