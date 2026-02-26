import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listRuns,
  getRun,
  createRun,
  updateRun,
  continueRun,
  approveRun,
  rejectRun,
} from '../api';
import { useAuthToken } from './useAuthToken';
import type { RunMode } from '@sapai/shared';

export function useRuns(filters?: { status?: string }) {
  const getToken = useAuthToken();
  return useQuery({
    queryKey: ['runs', filters],
    queryFn: async () => {
      const t = await getToken();
      return listRuns(filters, t);
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasActive = data?.some(
        (r) =>
          ['running', 'awaiting_approval'].includes(r.status) ||
          r.status.startsWith('paused_at_'),
      );
      return hasActive ? 2000 : 10000;
    },
  });
}

export function useRun(id: string | null) {
  const getToken = useAuthToken();
  return useQuery({
    queryKey: ['run', id],
    queryFn: async () => {
      const t = await getToken();
      return getRun(id!, t);
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const run = query.state.data?.run;
      if (!run) return false;
      return run.status === 'running' ? 1000 : false;
    },
  });
}

export function useCreateRun() {
  const qc = useQueryClient();
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (body: {
      message: string;
      name?: string;
      mode?: RunMode;
    }) => {
      const t = await getToken();
      return createRun(body, t);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['runs'] });
    },
  });
}

export function useUpdateRun() {
  const qc = useQueryClient();
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (params: { id: string; name?: string | null }) => {
      const t = await getToken();
      return updateRun(params.id, { name: params.name }, t);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['runs'] });
      qc.invalidateQueries({ queryKey: ['run', data.run.id] });
    },
  });
}

export function useContinueRun() {
  const qc = useQueryClient();
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (id: string) => {
      const t = await getToken();
      return continueRun(id, t);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['runs'] });
      qc.invalidateQueries({ queryKey: ['run', data.run.id] });
    },
  });
}

export function useApproveRun() {
  const qc = useQueryClient();
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (id: string) => {
      const t = await getToken();
      return approveRun(id, t);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['runs'] });
      qc.invalidateQueries({ queryKey: ['run', data.run.id] });
    },
  });
}

export function useRejectRun() {
  const qc = useQueryClient();
  const getToken = useAuthToken();
  return useMutation({
    mutationFn: async (id: string) => {
      const t = await getToken();
      return rejectRun(id, t);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['runs'] });
      qc.invalidateQueries({ queryKey: ['run', data.run.id] });
    },
  });
}
