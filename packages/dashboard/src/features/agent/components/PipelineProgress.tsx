type PipelineStage =
  | 'parsing'
  | 'validating'
  | 'resolving'
  | 'planning'
  | 'executing';

interface PipelineProgressProps {
  currentStage: PipelineStage | null;
  completedStages: PipelineStage[];
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
  error,
}: PipelineProgressProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="mb-2 text-xs font-medium uppercase text-gray-500">
        Pipeline Progress
      </p>
      <div className="space-y-1.5">
        {STAGES.map(({ key, label }) => {
          const isCompleted = completedStages.includes(key);
          const isCurrent = currentStage === key;
          const hasError = error && isCurrent;

          return (
            <div key={key} className="flex items-center gap-2 text-sm">
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
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
