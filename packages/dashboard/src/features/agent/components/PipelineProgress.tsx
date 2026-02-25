import type {
  PipelineStage,
  StageDetail,
  ProgressItem,
} from '../types';

interface PipelineProgressProps {
  currentStage: PipelineStage | null;
  completedStages: PipelineStage[];
  stageDetails?: StageDetail[];
  progressItems?: Record<string, ProgressItem[]>;
  error: string | null;
}

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: 'parsing', label: 'Parsing intent' },
  { key: 'validating', label: 'Validating' },
  { key: 'resolving', label: 'Resolving entities' },
  { key: 'planning', label: 'Building plan' },
  { key: 'executing', label: 'Executing' },
];

export function PipelineProgress({
  currentStage,
  completedStages,
  stageDetails = [],
  progressItems = {},
  error,
}: PipelineProgressProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="mb-2 text-xs font-medium uppercase text-gray-500">
        Pipeline Progress
      </p>
      <div className="space-y-1">
        {STAGES.map(({ key, label }) => {
          const isCompleted = completedStages.includes(key);
          const isCurrent = currentStage === key;
          const hasError = error && isCurrent;
          const detail = stageDetails.find((d) => d.stage === key);
          const detailText = isCompleted
            ? detail?.completedDetail
            : isCurrent && !hasError
              ? detail?.startedDetail
              : undefined;

          return (
            <div key={key}>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-5 text-center">
                  {hasError ? (
                    <span className="text-red-500">&#10005;</span>
                  ) : isCompleted ? (
                    <span className="text-green-500">&#10003;</span>
                  ) : isCurrent ? (
                    <span className="inline-block animate-spin text-blue-500">
                      &#9696;
                    </span>
                  ) : (
                    <span className="text-gray-300">&#9679;</span>
                  )}
                </span>
                <span
                  className={
                    hasError
                      ? 'text-red-600'
                      : isCompleted
                        ? 'text-green-700'
                        : isCurrent
                          ? 'font-medium text-blue-700'
                          : 'text-gray-400'
                  }
                >
                  {label}
                </span>
              </div>
              {hasError && detail?.startedDetail && (
                <p className="ml-7 text-xs text-gray-500">
                  {detail.startedDetail}
                </p>
              )}
              {hasError && error && (
                <p className="ml-7 text-xs text-red-600">{error}</p>
              )}
              {detailText && (
                <p
                  className={`ml-7 text-xs ${
                    isCompleted
                      ? 'text-green-600'
                      : isCurrent
                        ? 'text-blue-600'
                        : 'text-gray-400'
                  }`}
                >
                  {detailText}
                </p>
              )}
              {isCompleted && detail?.costEstimate && (
                <p className="ml-7 text-xs text-gray-400">
                  {'\u21B3'} {detail.costEstimate.inputTokens.toLocaleString()} input{' \u00B7 '}
                  {detail.costEstimate.outputTokens.toLocaleString()} output{' \u00B7 '}
                  {detail.costEstimate.model}{' \u00B7 '}
                  ${detail.costEstimate.totalCost.toFixed(4)}
                </p>
              )}
              {(progressItems[key]?.length ?? 0) > 0 && (
                <ul className="ml-7 mt-1 space-y-0.5">
                  {progressItems[key]?.map((p) => (
                    <li key={p.item} className="flex items-center gap-1.5 text-xs">
                      <span className="w-3 text-center">
                        {p.status === 'done' ? (
                          <span className="text-green-500">&#10003;</span>
                        ) : p.status === 'failed' ? (
                          <span className="text-red-500">&#10005;</span>
                        ) : (
                          <span className="inline-block animate-spin text-blue-400">&#9696;</span>
                        )}
                      </span>
                      <span
                        className={
                          p.status === 'done'
                            ? 'text-green-600'
                            : p.status === 'failed'
                              ? 'text-red-600'
                              : 'text-blue-600'
                        }
                      >
                        {p.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
