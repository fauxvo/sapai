import { createFileRoute } from '@tanstack/react-router';
import { IntentsCatalog } from '../features/agent/components/IntentsCatalog';

export const Route = createFileRoute('/agent/intents')({
  component: IntentsCatalog,
});
