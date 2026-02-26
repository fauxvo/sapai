import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRuns, useCreateRun, useDeleteRun } from '../hooks/useRuns';
import { StatusBadge, formatDuration } from './run-utils';
import { ConfirmModal } from '../../../components/ConfirmModal';
import type { PipelineRun, RunMode } from '../types';

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
  const [name, setName] = useState('');
  const [mode, setMode] = useState<RunMode>('auto');
  const { data: runs = [], isLoading, error } = useRuns();
  const createRun = useCreateRun();
  const deleteRunMutation = useDeleteRun();
  const [deleteTarget, setDeleteTarget] = useState<PipelineRun | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || createRun.isPending) return;

    const runName = name.trim() || undefined;
    try {
      const result = await createRun.mutateAsync({
        message,
        name: runName,
        mode,
      });
      setInput('');
      setName('');
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
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Run name (optional)"
            className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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
                <th className="px-5 py-2.5">Name / Input</th>
                <th className="px-5 py-2.5">Mode</th>
                <th className="px-5 py-2.5">Duration</th>
                <th className="px-5 py-2.5">Created</th>
                <th className="px-5 py-2.5" />
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
                  <td className="max-w-[300px] px-5 py-3">
                    {run.name ? (
                      <div>
                        <div className="truncate font-medium text-gray-900">
                          {run.name}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {run.inputMessage}
                        </div>
                      </div>
                    ) : (
                      <div className="truncate text-gray-700">
                        {run.inputMessage}
                      </div>
                    )}
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
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(run);
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete run"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete pipeline run"
        message={`Delete "${deleteTarget?.name || deleteTarget?.inputMessage || 'this run'}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteRunMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteRunMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
