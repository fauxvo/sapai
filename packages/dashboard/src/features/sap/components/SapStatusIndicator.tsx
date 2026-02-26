import { useSapHealth } from '../hooks/useSapHealth';
import type { SapHealthStatus } from '../hooks/useSapHealth';

const STATUS_CONFIG: Record<
  SapHealthStatus['status'],
  { label: string; dotClass: string; pulseClass: string }
> = {
  connected: {
    label: 'SAP Online',
    dotClass: 'bg-emerald-500',
    pulseClass: 'bg-emerald-400',
  },
  degraded: {
    label: 'SAP Degraded',
    dotClass: 'bg-amber-500',
    pulseClass: 'bg-amber-400',
  },
  error: {
    label: 'SAP Offline',
    dotClass: 'bg-red-500',
    pulseClass: 'bg-red-400',
  },
};

export function SapStatusIndicator() {
  const { data, isLoading, isError } = useSapHealth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        </span>
        SAP
      </div>
    );
  }

  // Network error (can't reach our own API)
  if (isError || !data) {
    return (
      <div
        className="flex items-center gap-1.5 text-sm text-gray-500"
        title="Unable to check SAP status"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
        </span>
        SAP Unknown
      </div>
    );
  }

  const config = STATUS_CONFIG[data.status];
  const isHealthy = data.status === 'connected';
  const tooltip = [
    config.label,
    data.responseTimeMs != null ? `${data.responseTimeMs}ms` : null,
    data.message,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className="flex items-center gap-1.5 text-sm text-gray-600"
      title={tooltip}
    >
      <span className="relative flex h-2.5 w-2.5">
        {!isHealthy && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.pulseClass}`}
          />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${config.dotClass}`}
        />
      </span>
      {config.label}
    </div>
  );
}
