import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  parseMessage,
  executePlan,
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} from '../api';
import type { AgentParseRequest, AgentExecuteRequest } from '@sapai/shared';
import { useAuthToken } from './useAuthToken';

export function useConversations() {
  const getToken = useAuthToken();
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const token = await getToken();
      return listConversations({ status: 'active', limit: 50 }, token);
    },
  });
}

export function useConversation(id: string | null) {
  const getToken = useAuthToken();
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const token = await getToken();
      return getConversation(id!, token);
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (
      body?: Parameters<typeof createConversation>[0],
    ) => {
      const token = await getToken();
      return createConversation(body, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      title?: string;
      status?: string;
    }) => {
      const token = await getToken();
      const { id, ...body } = params;
      return updateConversation(id, body, token);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({
        queryKey: ['conversation', variables.id],
      });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteConversation(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useParse() {
  const queryClient = useQueryClient();
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (body: AgentParseRequest) => {
      const token = await getToken();
      return parseMessage(body, token);
    },
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
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (body: AgentExecuteRequest) => {
      const token = await getToken();
      return executePlan(body, token);
    },
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
