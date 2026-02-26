import { createFileRoute } from '@tanstack/react-router';
import { RunDetail } from '../features/agent/components/RunDetail';

export const Route = createFileRoute('/agent/run/$id')({
  component: () => {
    const { id } = Route.useParams();
    return <RunDetail runId={id} />;
  },
});
