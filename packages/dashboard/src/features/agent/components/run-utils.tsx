import type { PipelineRunStatus } from '../types';

export const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  running: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    label: 'Running',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'Completed',
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: 'Failed',
  },
  awaiting_approval: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'Awaiting Approval',
  },
  paused_at_parsing: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Paused (Parsing)',
  },
  paused_at_validating: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Paused (Validating)',
  },
  paused_at_resolving: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Paused (Resolving)',
  },
  paused_at_planning: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Paused (Planning)',
  },
  paused_at_executing: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Paused (Executing)',
  },
};

export function StatusBadge({ status }: { status: PipelineRunStatus }) {
  const style = STATUS_STYLES[status] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {status === 'running' && (
        <span className="inline-block h-2 w-2 animate-spin rounded-full border border-blue-600 border-t-transparent" />
      )}
      {style.label}
    </span>
  );
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
