import { createFileRoute } from '@tanstack/react-router';
import { AuditLog } from '../features/agent/components/AuditLog';

export const Route = createFileRoute('/agent/history')({
  component: AuditLog,
});
