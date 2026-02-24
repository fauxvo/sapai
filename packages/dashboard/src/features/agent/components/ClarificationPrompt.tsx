interface ClarificationPromptProps {
  message: string;
  missingFields: string[];
}

export function ClarificationPrompt({
  message,
  missingFields,
}: ClarificationPromptProps) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="mb-2 text-sm font-medium text-blue-800">
        More information needed
      </p>
      <p className="mb-2 text-sm text-gray-700">{message}</p>
      {missingFields.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {missingFields.map((field) => (
            <span
              key={field}
              className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
            >
              {field}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
