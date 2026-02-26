import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRuns, useCreateRun } from '../hooks/useRuns';
import type { PipelineRun, PipelineRunStatus, RunMode } from '../types';

const STATUS_STYLES: Record<
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

function StatusBadge({ status }: { status: PipelineRunStatus }) {
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

function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RunList() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<RunMode>('auto');
  const { data: runs = [], isLoading, error } = useRuns();
  const createRun = useCreateRun();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || createRun.isPending) return;

    try {
      const result = await createRun.mutateAsync({ message, mode });
      setInput('');
      navigate({
        to: '/agent/run/$id',
        params: { id: result.run.id },
      });
    } catch {
      // Error displayed via createRun.error
    }
  };

  const handleRowClick = (run: PipelineRun) => {
    navigate({ to: '/agent/run/$id', params: { id: run.id } });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* New Pipeline Run card */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          New Pipeline Run
        </h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to do with SAP data..."
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
              <button
                type="button"
                onClick={() => setMode('auto')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'auto'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setMode('step')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'step'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Step
              </button>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || createRun.isPending}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createRun.isPending ? 'Starting...' : 'Start Run'}
            </button>
          </div>
        </form>
        {createRun.error && (
          <p className="mt-2 text-sm text-red-600">{createRun.error.message}</p>
        )}
      </div>

      {/* Runs table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">
            Pipeline Runs
          </h2>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Loading runs...
          </div>
        ) : error ? (
          <div className="px-5 py-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load runs: {error.message}
            </div>
          </div>
        ) : runs.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No pipeline runs yet. Start one above.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5">Input</th>
                <th className="px-5 py-2.5">Mode</th>
                <th className="px-5 py-2.5">Duration</th>
                <th className="px-5 py-2.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {runs.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => handleRowClick(run)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-3">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="max-w-[300px] truncate px-5 py-3 text-gray-700">
                    {run.inputMessage}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        run.mode === 'step'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {run.mode}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                    {formatDuration(run.durationMs)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                    {formatTime(run.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
