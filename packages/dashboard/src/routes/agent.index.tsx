import { createFileRoute } from '@tanstack/react-router';
import { AgentChat } from '../features/agent/components/AgentChat';

export const Route = createFileRoute('/agent/')({
  component: AgentChat,
});
