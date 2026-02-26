import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  useRun,
  useUpdateRun,
  useDeleteRun,
  useRetryRun,
  useContinueRun,
  useApproveRun,
  useRejectRun,
} from '../hooks/useRuns';
import { useRunStream } from '../hooks/useRunStream';
import { PipelineProgress } from './PipelineProgress';
import { ExecutionPlanCard } from './ExecutionPlanCard';
import type {
  PipelineStageRecord,
  PipelineRunStatus,
  StageDetail,
  ProgressItem,
} from '../types';
import type { ExecutionPlan } from '@sapai/shared';

interface RunDetailProps {
  runId: string;
}

function deriveProgressProps(stages: PipelineStageRecord[]) {
  const completedStages = stages
    .filter((s) => s.status === 'completed')
    .map((s) => s.stage);
  const currentStage =
    stages.find((s) => s.status === 'running')?.stage ?? null;
  const failedStage = stages.find((s) => s.status === 'failed');

  const stageDetails: StageDetail[] = stages.map((s) => ({
    stage: s.stage,
    startedDetail: s.detail ?? undefined,
    completedDetail: s.detail ?? undefined,
    costEstimate: s.costEstimate ?? undefined,
  }));

  const progressItems: Record<string, ProgressItem[]> = Object.fromEntries(
    stages.map((s) => [
      s.stage,
      (s.progressItems ?? []).map((p) => ({
        item: p.item,
        detail: p.detail,
        status: p.status,
        entityType: p.entityType,
        matchType: p.matchType,
        confidence: p.confidence,
        originalValue: p.originalValue,
        resolvedValue: p.resolvedValue,
        metadata: p.metadata,
        parseConfidence: p.parseConfidence,
        candidates: p.candidates?.map((c) => ({
          resolvedValue: c.resolvedValue,
          resolvedLabel: c.resolvedLabel,
          confidence: c.confidence as string,
          matchType: c.matchType,
          metadata: c.metadata,
        })),
      })),
    ]),
  );

  const error = failedStage?.error ?? null;

  return { currentStage, completedStages, stageDetails, progressItems, error };
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  running: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Running' },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'Completed',
  },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
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

function formatTimestamp(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Extract the execution plan from the planning stage output if available.
 * The planning stage output is expected to contain the ExecutionPlan data.
 */
function extractPlan(stages: PipelineStageRecord[]): ExecutionPlan | null {
  const planningStage = stages.find((s) => s.stage === 'planning');
  if (!planningStage?.output) return null;
  const output = planningStage.output as Record<string, unknown>;
  // The output from planning stage should contain plan data
  if (output.planId && output.intents) {
    return output as unknown as ExecutionPlan;
  }
  // Sometimes the plan is nested under a plan key
  if (output.plan && typeof output.plan === 'object') {
    return output.plan as ExecutionPlan;
  }
  return null;
}

export function RunDetail({ runId }: RunDetailProps) {
  const { data, isLoading, error } = useRun(runId);
  const navigate = useNavigate();
  const updateRunMutation = useUpdateRun();
  const deleteRunMutation = useDeleteRun();
  const retryRunMutation = useRetryRun();
  const continueRunMutation = useContinueRun();
  const approveRunMutation = useApproveRun();
  const rejectRunMutation = useRejectRun();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  const run = data?.run ?? null;
  const stages = data?.stages ?? [];

  // Connect SSE for live updates when running
  useRunStream(runId, run?.status === 'running');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-gray-400">Loading run...</div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Link
          to="/agent"
          className="mb-4 inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          &larr; Back to runs
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error?.message ?? 'Run not found'}
        </div>
      </div>
    );
  }

  const progressProps = deriveProgressProps(stages);
  const plan = extractPlan(stages);

  const handleContinue = () => {
    continueRunMutation.mutate(runId);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApprove = (_planId: string) => {
    approveRunMutation.mutate(runId);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReject = (_planId: string) => {
    rejectRunMutation.mutate(runId);
  };

  const handleRetry = () => {
    retryRunMutation.mutate(runId);
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this run? This cannot be undone.')) return;
    deleteRunMutation.mutate(runId, {
      onSuccess: () => navigate({ to: '/agent' }),
    });
  };

  const isActionPending =
    continueRunMutation.isPending ||
    approveRunMutation.isPending ||
    rejectRunMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Back link */}
      <Link
        to="/agent"
        className="mb-4 inline-block text-sm text-blue-600 hover:text-blue-800"
      >
        &larr; Back to runs
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
        {/* Name row */}
        <div className="mb-3">
          {isEditingName ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = editName.trim();
                updateRunMutation.mutate(
                  { id: runId, name: trimmed || null },
                  { onSuccess: () => setIsEditingName(false) },
                );
              }}
            >
              <input
                autoFocus
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Run name"
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={updateRunMutation.isPending}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="rounded px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditName(run.name ?? '');
                setIsEditingName(true);
              }}
              className="group flex items-center gap-2 text-left"
              title="Click to edit name"
            >
              <span className="text-lg font-semibold text-gray-900">
                {run.name ?? (
                  <span className="text-sm font-normal italic text-gray-400">
                    Unnamed run
                  </span>
                )}
              </span>
              <svg
                className="h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={run.status} />
          <span
            className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
              run.mode === 'step'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {run.mode} mode
          </span>
          <span className="font-mono text-xs text-gray-400">{run.id}</span>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium uppercase text-gray-500">Input</p>
          <p className="mt-1 text-sm text-gray-800">{run.inputMessage}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>Started: {formatTimestamp(run.startedAt)}</span>
          {run.completedAt && (
            <span>Completed: {formatTimestamp(run.completedAt)}</span>
          )}
          <span>Duration: {formatDuration(run.durationMs)}</span>
        </div>
      </div>

      {/* Pipeline progress */}
      <div className="mb-6">
        <PipelineProgress
          currentStage={progressProps.currentStage}
          completedStages={progressProps.completedStages}
          stageDetails={progressProps.stageDetails}
          progressItems={progressProps.progressItems}
          error={progressProps.error}
        />
      </div>

      {/* Action buttons */}
      {run.status.startsWith('paused_at_') ? (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-3 text-sm text-gray-600">
            This run is paused in step mode. Continue to proceed to the next
            stage.
          </p>
          <button
            onClick={handleContinue}
            disabled={isActionPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {continueRunMutation.isPending
              ? 'Continuing...'
              : 'Continue to Next Stage'}
          </button>
          {continueRunMutation.error && (
            <p className="mt-2 text-sm text-red-600">
              {continueRunMutation.error.message}
            </p>
          )}
        </div>
      ) : null}

      {run.status === 'awaiting_approval' && plan && (
        <div className="mb-6">
          <ExecutionPlanCard
            plan={plan}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isActionPending}
          />
          {approveRunMutation.error && (
            <p className="mt-2 text-sm text-red-600">
              {approveRunMutation.error.message}
            </p>
          )}
          {rejectRunMutation.error && (
            <p className="mt-2 text-sm text-red-600">
              {rejectRunMutation.error.message}
            </p>
          )}
        </div>
      )}

      {run.status === 'awaiting_approval' && !plan && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm text-amber-800">
            This run is awaiting approval.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => approveRunMutation.mutate(runId)}
              disabled={isActionPending}
              className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {approveRunMutation.isPending ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={() => rejectRunMutation.mutate(runId)}
              disabled={isActionPending}
              className="rounded-md bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {rejectRunMutation.isPending ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      {run.status === 'failed' && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-1 text-sm font-medium text-red-800">Run failed</p>
          {run.error && (
            <p className="mb-3 text-sm text-red-700">{run.error}</p>
          )}
          <button
            onClick={handleRetry}
            disabled={retryRunMutation.isPending}
            className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {retryRunMutation.isPending ? 'Retrying...' : 'Retry Failed Stage'}
          </button>
          {retryRunMutation.error && (
            <p className="mt-2 text-sm text-red-600">
              {retryRunMutation.error.message}
            </p>
          )}
        </div>
      )}

      {/* Result */}
      {run.status === 'completed' &&
      run.result !== null &&
      run.result !== undefined ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="mb-2 text-xs font-medium uppercase text-green-700">
            Result
          </p>
          <pre className="max-h-64 overflow-auto rounded bg-white p-3 text-xs text-gray-700">
            {JSON.stringify(run.result, null, 2)}
          </pre>
        </div>
      ) : null}

      {/* Delete */}
      <div className="mt-8 border-t border-gray-200 pt-4">
        <button
          onClick={handleDelete}
          disabled={deleteRunMutation.isPending}
          className="text-sm text-gray-400 hover:text-red-600 disabled:opacity-50"
        >
          {deleteRunMutation.isPending ? 'Deleting...' : 'Delete this run'}
        </button>
      </div>
    </div>
  );
}
