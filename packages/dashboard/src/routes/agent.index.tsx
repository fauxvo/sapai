import { createFileRoute } from '@tanstack/react-router';
import { RunList } from '../features/agent/components/RunList';

export const Route = createFileRoute('/agent/')({
  component: RunList,
});
