import { createFileRoute } from '@tanstack/react-router';
import { RunList } from '../features/agent/components/RunList';

type AgentSearch = {
  conversationId?: string;
};

export const Route = createFileRoute('/agent/')({
  validateSearch: (search: Record<string, unknown>): AgentSearch => ({
    conversationId: (search.conversationId as string) || undefined,
  }),
  component: RunList,
});
