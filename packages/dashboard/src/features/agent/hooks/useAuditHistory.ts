import { useQuery } from '@tanstack/react-query';
import { getAuditHistory } from '../api';

export function useAuditHistory(params?: {
  conversationId?: string;
  phase?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['auditHistory', params],
    queryFn: () => getAuditHistory(params),
  });
}
