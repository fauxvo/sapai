import { useState } from 'react';
import { useAuditHistory } from '../hooks/useAuditHistory';
import type { AuditLogEntry } from '@sapai/shared';

const PHASE_COLORS: Record<string, string> = {
  parse: 'bg-blue-100 text-blue-700',
  validate: 'bg-purple-100 text-purple-700',
  resolve: 'bg-cyan-100 text-cyan-700',
  plan: 'bg-amber-100 text-amber-700',
  approve: 'bg-green-100 text-green-700',
  execute: 'bg-emerald-100 text-emerald-700',
  error: 'bg-red-100 text-red-700',
};

const PHASES = [
  'parse',
  'validate',
  'resolve',
  'plan',
  'approve',
  'execute',
  'error',
] as const;

export function AuditLog() {
  const [phaseFilter, setPhaseFilter] = useState<string | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: entries = [],
    isLoading,
    error,
  } = useAuditHistory({
    phase: phaseFilter,
    limit: 100,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-gray-400">Loading audit log...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load audit log: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => setPhaseFilter(undefined)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              !phaseFilter
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {PHASES.map((phase) => (
            <button
              key={phase}
              onClick={() =>
                setPhaseFilter(phaseFilter === phase ? undefined : phase)
              }
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                phaseFilter === phase
                  ? 'bg-gray-900 text-white'
                  : `${PHASE_COLORS[phase]} hover:opacity-80`
              }`}
            >
              {phase}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          No audit entries found
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2.5">Time</th>
                <th className="px-4 py-2.5">Phase</th>
                <th className="px-4 py-2.5">Conversation</th>
                <th className="px-4 py-2.5">Duration</th>
                <th className="px-4 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <AuditRow
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedId === entry.id}
                  onToggle={() =>
                    setExpandedId(expandedId === entry.id ? null : entry.id)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AuditRow({
  entry,
  isExpanded,
  onToggle,
}: {
  entry: AuditLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer transition-colors hover:bg-gray-50"
        onClick={onToggle}
      >
        <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
          {new Date(entry.timestamp).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </td>
        <td className="px-4 py-2.5">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PHASE_COLORS[entry.phase] ?? 'bg-gray-100 text-gray-700'}`}
          >
            {entry.phase}
          </span>
        </td>
        <td className="max-w-[200px] truncate px-4 py-2.5 font-mono text-xs text-gray-500">
          {entry.conversationId ?? '-'}
        </td>
        <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
          {entry.durationMs}ms
        </td>
        <td className="px-4 py-2.5 text-gray-400">
          {isExpanded ? 'Hide' : 'Show'}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="bg-gray-50 px-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                  Input
                </p>
                <pre className="max-h-48 overflow-auto rounded bg-white p-2 text-xs text-gray-700">
                  {JSON.stringify(entry.input, null, 2)}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                  Output
                </p>
                <pre className="max-h-48 overflow-auto rounded bg-white p-2 text-xs text-gray-700">
                  {JSON.stringify(entry.output, null, 2)}
                </pre>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
