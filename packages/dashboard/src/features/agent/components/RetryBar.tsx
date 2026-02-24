interface RetryBarProps {
  errorMessage: string;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onEditRetry: () => void;
}

export function RetryBar({
  errorMessage,
  retryCount,
  maxRetries,
  onRetry,
  onEditRetry,
}: RetryBarProps) {
  const canRetry = retryCount < maxRetries;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="mb-2 text-sm text-red-700">{errorMessage}</p>
      {!canRetry && (
        <p className="mb-2 text-xs text-red-500">
          Maximum retries reached. Please try a different message.
        </p>
      )}
      <div className="flex gap-2">
        {canRetry && (
          <button
            onClick={onRetry}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Retry ({retryCount}/{maxRetries})
          </button>
        )}
        <button
          onClick={onEditRetry}
          className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300"
        >
          Edit &amp; Retry
        </button>
      </div>
    </div>
  );
}
