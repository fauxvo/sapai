import { useState } from 'react';
import { useAuditHistory } from '../hooks/useAuditHistory';
import { useIntents } from '../hooks/useAgent';
import type { AuditLogEntry, IntentDefinition } from '@sapai/shared';

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
  const { data: intents = [] } = useIntents();
  const intentMap = new Map(intents.map((i) => [i.id, i]));

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
                <th className="px-4 py-2.5">Action</th>
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
                  intentMap={intentMap}
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

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-emerald-100 text-emerald-700',
  PATCH: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-red-100 text-red-700',
};

function extractActionSummary(
  entry: AuditLogEntry,
  intentMap: Map<string, IntentDefinition>,
): {
  intentName?: string;
  intentId?: string;
  apiCall?: string;
  method?: string;
} {
  const input = entry.input as Record<string, unknown> | undefined;
  const output = entry.output as Record<string, unknown> | undefined;

  // Parse phase: intents are in the output
  if (entry.phase === 'parse' && output) {
    const intents = (output as { intents?: Array<{ intentId: string }> })
      .intents;
    if (intents?.[0]) {
      const def = intentMap.get(intents[0].intentId);
      return {
        intentId: intents[0].intentId,
        intentName: def?.name,
        apiCall: def?.apiEndpoint.path,
        method: def?.apiEndpoint.method,
      };
    }
  }

  // Plan/execute phases: look for intentId or apiCall in input/output
  if (
    entry.phase === 'plan' ||
    entry.phase === 'execute' ||
    entry.phase === 'approve'
  ) {
    const intents =
      (
        input as {
          intents?: Array<{
            intentId: string;
            apiCall?: { method: string; path: string };
          }>;
        }
      )?.intents ??
      (
        output as {
          intents?: Array<{
            intentId: string;
            apiCall?: { method: string; path: string };
          }>;
        }
      )?.intents;
    if (intents?.[0]) {
      const def = intentMap.get(intents[0].intentId);
      return {
        intentId: intents[0].intentId,
        intentName: def?.name,
        apiCall: intents[0].apiCall?.path ?? def?.apiEndpoint.path,
        method: intents[0].apiCall?.method ?? def?.apiEndpoint.method,
      };
    }
  }

  // Resolve phase: look for intentId in input
  if (entry.phase === 'resolve' && input) {
    const intentId = (input as { intentId?: string }).intentId;
    if (intentId) {
      const def = intentMap.get(intentId);
      return {
        intentId,
        intentName: def?.name,
        apiCall: def?.apiEndpoint.path,
        method: def?.apiEndpoint.method,
      };
    }
  }

  // Validate phase
  if (entry.phase === 'validate' && input) {
    const intents = (input as { intents?: Array<{ intentId: string }> })
      .intents;
    if (intents?.[0]) {
      const def = intentMap.get(intents[0].intentId);
      return {
        intentId: intents[0].intentId,
        intentName: def?.name,
      };
    }
  }

  return {};
}

// --- Phase-specific detail renderers ---

function ParseDetail({
  entry,
  intentMap,
}: {
  entry: AuditLogEntry;
  intentMap: Map<string, IntentDefinition>;
}) {
  const input = entry.input as { message?: string } | undefined;
  const output = entry.output as
    | {
        intents?: Array<{
          intentId: string;
          confidence: number;
          extractedFields: Record<string, unknown>;
          fieldConfidence?: Record<
            string,
            { confidence: number; rawValue: string; interpretation: string }
          >;
        }>;
        unhandledContent?: string;
      }
    | undefined;

  const intents = output?.intents ?? [];

  return (
    <div className="space-y-3">
      {/* User message */}
      {input?.message && (
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
            User Message
          </p>
          <p className="rounded bg-white px-3 py-2 text-sm text-gray-800 ring-1 ring-gray-200">
            {input.message}
          </p>
        </div>
      )}

      {/* Detected intents */}
      {intents.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Detected {intents.length} Intent{intents.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {intents.map((intent, i) => {
              const def = intentMap.get(intent.intentId);
              const pct = Math.round(intent.confidence * 100);
              const pctColor =
                pct >= 90
                  ? 'text-emerald-600'
                  : pct >= 70
                    ? 'text-blue-600'
                    : 'text-amber-600';
              return (
                <div
                  key={i}
                  className="rounded bg-white p-2.5 ring-1 ring-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {def?.name ?? intent.intentId}
                      </span>
                      {def && (
                        <span className="flex items-center gap-1">
                          <span
                            className={`rounded px-1 py-0.5 font-mono text-[9px] font-bold ${METHOD_COLORS[def.apiEndpoint.method] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {def.apiEndpoint.method}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400">
                            {def.apiEndpoint.path}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${pctColor}`}>
                      {pct}% confidence
                    </span>
                  </div>
                  {/* Extracted fields */}
                  {Object.keys(intent.extractedFields).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {Object.entries(intent.extractedFields)
                        .filter(([, v]) => v !== undefined && v !== null)
                        .map(([key, val]) => {
                          const fc = intent.fieldConfidence?.[key];
                          return (
                            <span key={key} className="text-xs text-gray-600">
                              <span className="text-gray-400">{key}:</span>{' '}
                              <span className="font-mono font-medium">
                                {String(val)}
                              </span>
                              {fc && (
                                <span className="ml-1 text-[10px] text-gray-400">
                                  ({Math.round(fc.confidence * 100)}%)
                                </span>
                              )}
                            </span>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : output?.unhandledContent ? (
        <div className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-amber-200">
          No intents detected: {output.unhandledContent}
        </div>
      ) : null}
    </div>
  );
}

function ExecuteDetail({
  entry,
  intentMap,
}: {
  entry: AuditLogEntry;
  intentMap: Map<string, IntentDefinition>;
}) {
  const input = entry.input as
    | {
        intentId?: string;
        apiCall?: {
          method: string;
          path: string;
          body?: Record<string, unknown>;
        };
      }
    | undefined;
  const output = entry.output as
    | {
        intentId?: string;
        success?: boolean;
        data?: unknown;
        error?: string;
      }
    | undefined;

  const def = input?.intentId ? intentMap.get(input.intentId) : undefined;
  const succeeded = output?.success === true;

  return (
    <div className="space-y-2">
      {/* API call summary */}
      {input?.apiCall && (
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${METHOD_COLORS[input.apiCall.method] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {input.apiCall.method}
          </span>
          <span className="font-mono text-xs text-gray-700">
            {input.apiCall.path}
          </span>
          <span className="text-xs text-gray-400">{entry.durationMs}ms</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              succeeded
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {succeeded ? 'SUCCESS' : 'FAILED'}
          </span>
        </div>
      )}

      {/* Request body if present */}
      {input?.apiCall?.body && Object.keys(input.apiCall.body).length > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Request Body
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 rounded bg-white px-3 py-2 ring-1 ring-gray-200">
            {Object.entries(input.apiCall.body).map(([key, val]) => (
              <span key={key} className="text-xs text-gray-600">
                <span className="text-gray-400">{key}:</span>{' '}
                <span className="font-mono font-medium">{String(val)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {succeeded && output?.data ? (
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Response ({def?.name ?? input?.intentId ?? 'result'})
          </p>
          <pre className="max-h-40 overflow-auto rounded bg-white px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-200">
            {JSON.stringify(output.data, null, 2)}
          </pre>
        </div>
      ) : output?.error ? (
        <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {output.error}
        </div>
      ) : null}
    </div>
  );
}

function ApproveDetail({ entry }: { entry: AuditLogEntry }) {
  const input = entry.input as { approved?: boolean } | undefined;
  const approved = input?.approved === true;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${
          approved
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {approved ? 'Approved' : 'Rejected'}
      </span>
      {entry.planId && (
        <span className="font-mono text-xs text-gray-400">
          Plan: {entry.planId.slice(0, 8)}...
        </span>
      )}
    </div>
  );
}

function ErrorDetail({ entry }: { entry: AuditLogEntry }) {
  const output = entry.output as
    | { error?: string; success?: boolean; intentId?: string }
    | undefined;

  return (
    <div className="space-y-2">
      {output?.error && (
        <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {output.error}
        </div>
      )}
      {output?.intentId && (
        <p className="text-xs text-gray-500">
          Failed during:{' '}
          <span className="font-mono font-medium">{output.intentId}</span>
        </p>
      )}
    </div>
  );
}

// --- Main row component ---

function AuditRow({
  entry,
  intentMap,
  isExpanded,
  onToggle,
}: {
  entry: AuditLogEntry;
  intentMap: Map<string, IntentDefinition>;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [showRaw, setShowRaw] = useState(false);
  const action = extractActionSummary(entry, intentMap);

  // One-line summary for the row (before expansion)
  const rowSummary = getRowSummary(entry, action);

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
        <td className="px-4 py-2.5">
          {action.intentName ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-800">
                {action.intentName}
              </span>
              {action.apiCall && (
                <span className="flex items-center gap-1">
                  {action.method && (
                    <span
                      className={`rounded px-1 py-0.5 font-mono text-[9px] font-bold ${METHOD_COLORS[action.method] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {action.method}
                    </span>
                  )}
                  <span className="truncate font-mono text-[10px] text-gray-400">
                    {action.apiCall}
                  </span>
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </td>
        <td className="max-w-[160px] truncate px-4 py-2.5 font-mono text-xs text-gray-500">
          {entry.conversationId ?? '-'}
        </td>
        <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
          {entry.durationMs}ms
        </td>
        <td className="px-4 py-2.5 text-xs text-gray-500">{rowSummary}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-4 py-3">
            {/* Phase-specific readable detail */}
            {!showRaw && entry.phase === 'parse' && (
              <ParseDetail entry={entry} intentMap={intentMap} />
            )}
            {!showRaw && entry.phase === 'execute' && (
              <ExecuteDetail entry={entry} intentMap={intentMap} />
            )}
            {!showRaw && entry.phase === 'approve' && (
              <ApproveDetail entry={entry} />
            )}
            {!showRaw && entry.phase === 'error' && (
              <ErrorDetail entry={entry} />
            )}
            {/* Fallback / raw toggle */}
            {(showRaw ||
              !['parse', 'execute', 'approve', 'error'].includes(
                entry.phase,
              )) && (
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
            )}
            {/* Toggle for raw JSON */}
            {['parse', 'execute', 'approve', 'error'].includes(entry.phase) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRaw(!showRaw);
                }}
                className="mt-2 text-[10px] font-medium text-blue-500 hover:text-blue-700"
              >
                {showRaw ? 'Show formatted' : 'Show raw JSON'}
              </button>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function getRowSummary(
  entry: AuditLogEntry,
  action: { intentName?: string },
): string {
  const output = entry.output as Record<string, unknown> | undefined;

  if (entry.phase === 'parse') {
    const intents = (
      output as { intents?: Array<{ intentId: string; confidence: number }> }
    )?.intents;
    if (intents && intents.length > 0) {
      return `${intents.length} intent(s), ${Math.round(intents[0].confidence * 100)}% conf`;
    }
    return 'No intents detected';
  }

  if (entry.phase === 'execute') {
    const success = (output as { success?: boolean })?.success;
    return success === true ? 'Succeeded' : success === false ? 'Failed' : '-';
  }

  if (entry.phase === 'approve') {
    const approved = (entry.input as { approved?: boolean })?.approved;
    return approved ? 'Approved' : 'Rejected';
  }

  if (entry.phase === 'error') {
    const error = (output as { error?: string })?.error;
    return error
      ? error.slice(0, 40) + (error.length > 40 ? '...' : '')
      : 'Error';
  }

  return action.intentName ?? '-';
}
