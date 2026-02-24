import { createFileRoute } from '@tanstack/react-router';
import { AgentChat } from '../features/agent/components/AgentChat';

type AgentSearch = {
  conversationId?: string;
};

export const Route = createFileRoute('/agent/')({
  validateSearch: (search: Record<string, unknown>): AgentSearch => ({
    conversationId: (search.conversationId as string) || undefined,
  }),
  component: AgentChat,
});
