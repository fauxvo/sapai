import type { ExecutionPlan } from '@sapai/shared';

interface ExecutionPlanCardProps {
  plan: ExecutionPlan;
  onApprove: (planId: string) => void;
  onReject: (planId: string) => void;
  isLoading?: boolean;
}

export function ExecutionPlanCard({
  plan,
  onApprove,
  onReject,
  isLoading,
}: ExecutionPlanCardProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium text-amber-800">
          Plan requires approval
        </span>
      </div>
      <p className="mb-3 text-sm text-gray-700">{plan.summary}</p>

      <div className="mb-3 space-y-2">
        {plan.intents.map((action, i) => (
          <div
            key={i}
            className="rounded border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <MethodBadge method={action.apiCall.method} />
              <span className="font-mono text-xs text-gray-600">
                {action.apiCall.path}
              </span>
            </div>
            <p className="mt-1 text-gray-600">{action.description}</p>
            {action.risks.length > 0 && (
              <div className="mt-1">
                {action.risks.map((risk, j) => (
                  <span
                    key={j}
                    className="mr-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700"
                  >
                    {risk}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onApprove(plan.planId)}
          disabled={isLoading}
          className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Executing...' : 'Approve & Execute'}
        </button>
        <button
          onClick={() => onReject(plan.planId)}
          disabled={isLoading}
          className="rounded-md bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PATCH: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-semibold ${colors[method] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {method}
    </span>
  );
}
