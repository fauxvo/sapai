import { useState } from 'react';
import type {
  PipelineStage,
  StageDetail,
  ProgressItem,
  ParseFieldConfidence,
} from '../types';
import type {
  CorroborationResult,
  CorroborationSignal,
} from '@sapai/shared';

function ConfidenceMeter({ pct }: { pct: number }) {
  const barColor =
    pct >= 90
      ? 'bg-emerald-500'
      : pct >= 70
        ? 'bg-blue-500'
        : pct >= 50
          ? 'bg-amber-500'
          : 'bg-red-500';
  const trackColor =
    pct >= 90
      ? 'bg-emerald-100'
      : pct >= 70
        ? 'bg-blue-100'
        : pct >= 50
          ? 'bg-amber-100'
          : 'bg-red-100';

  return (
    <div
      className={`h-1 w-10 overflow-hidden rounded-full ${trackColor}`}
      title={`${pct}% confidence`}
    >
      <div
        className={`h-full rounded-full transition-all ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ParseConfidenceBadge({ fc }: { fc: ParseFieldConfidence }) {
  const pct = Math.round(fc.confidence * 100);
  const textColor =
    pct >= 90
      ? 'text-emerald-700'
      : pct >= 70
        ? 'text-blue-700'
        : pct >= 50
          ? 'text-amber-700'
          : 'text-red-700';
  const bgColor =
    pct >= 90
      ? 'bg-emerald-50 ring-emerald-200'
      : pct >= 70
        ? 'bg-blue-50 ring-blue-200'
        : pct >= 50
          ? 'bg-amber-50 ring-amber-200'
          : 'bg-red-50 ring-red-200';

  return (
    <div className="mt-1 space-y-1">
      <div
        className={`inline-flex items-center gap-2 rounded-md px-2 py-1 ring-1 ring-inset ${bgColor}`}
      >
        <ConfidenceMeter pct={pct} />
        <span className={`text-[10px] font-semibold ${textColor}`}>{pct}%</span>
        <span className="text-[10px] text-gray-500">{fc.interpretation}</span>
      </div>
      {fc.alternatives && fc.alternatives.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-0.5">
          <span className="text-[9px] font-medium text-amber-500">Alt:</span>
          {fc.alternatives.map((alt) => (
            <span
              key={alt}
              className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-700 ring-1 ring-inset ring-amber-200/60"
            >
              {alt}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface PipelineProgressProps {
  currentStage: PipelineStage | null;
  completedStages: PipelineStage[];
  stageDetails?: StageDetail[];
  progressItems?: Record<string, ProgressItem[]>;
  error: string | null;
}

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: 'decomposing', label: 'Decomposing message' },
  { key: 'parsing', label: 'Parsing intent' },
  { key: 'validating', label: 'Validating' },
  { key: 'resolving', label: 'Resolving entities' },
  { key: 'guarding', label: 'Checking rules' },
  { key: 'planning', label: 'Building plan' },
  { key: 'executing', label: 'Executing' },
];

// --- Subcomponents for resolve stage ---

interface POHeaderMeta {
  poNumber: string;
  supplier: string;
  companyCode: string;
  orderType: string;
  purchasingOrg: string;
  purchasingGroup: string;
  currency: string;
  paymentTerms: string;
  createdBy: string;
  creationDate: string;
  isDeleted: boolean;
  releaseNotCompleted: boolean;
  totalItems: number;
}

const FIELD_LABELS: Record<string, string> = {
  poNumber: 'PO Number',
  itemNumber: 'PO Item',
  itemIdentifier: 'Item Identifier',
  quantity: 'Quantity',
  newQuantity: 'New Quantity',
  deliveryDate: 'Delivery Date',
  plant: 'Plant',
  storageLocation: 'Storage Location',
  material: 'Material',
  description: 'Description',
  currency: 'Currency',
  netPrice: 'Net Price',
  unit: 'Unit',
  orderQuantity: 'Order Quantity',
  purchaseOrderQuantityUnit: 'Quantity Unit',
};

interface FieldConfidenceData {
  confidence: number;
  rawValue: string;
  interpretation: string;
  alternatives?: string[];
}

function ParsedFieldRow({
  fieldName,
  value,
  fc,
}: {
  fieldName: string;
  value: unknown;
  fc?: FieldConfidenceData;
}) {
  const [expanded, setExpanded] = useState(false);
  const pct = fc ? Math.round(fc.confidence * 100) : null;
  const hasAlternatives = !!(fc?.alternatives && fc.alternatives.length > 0);

  const badgeText =
    pct === null
      ? 'text-gray-400'
      : pct >= 90
        ? 'text-emerald-600'
        : pct >= 70
          ? 'text-blue-600'
          : pct >= 50
            ? 'text-amber-600'
            : 'text-red-600';
  const barColor =
    pct === null
      ? 'bg-gray-300'
      : pct >= 90
        ? 'bg-emerald-500'
        : pct >= 70
          ? 'bg-blue-500'
          : pct >= 50
            ? 'bg-amber-500'
            : 'bg-red-500';
  const trackColor =
    pct === null
      ? 'bg-gray-100'
      : pct >= 90
        ? 'bg-emerald-100'
        : pct >= 70
          ? 'bg-blue-100'
          : pct >= 50
            ? 'bg-amber-100'
            : 'bg-red-100';

  return (
    <>
      <tr
        className={`group transition-colors hover:bg-amber-50/80 ${hasAlternatives ? 'cursor-pointer' : ''}`}
        onClick={hasAlternatives ? () => setExpanded(!expanded) : undefined}
      >
        {/* Field name */}
        <td className="py-1.5 pl-2.5 pr-2">
          <div className="flex items-center gap-1.5">
            {hasAlternatives && (
              <svg
                className={`h-2.5 w-2.5 flex-shrink-0 text-amber-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            )}
            <span className="text-[11px] font-medium text-amber-800">
              {FIELD_LABELS[fieldName] ?? fieldName}
            </span>
          </div>
          {fc?.rawValue && (
            <p
              className={`text-[9px] text-amber-500/80 ${hasAlternatives ? 'ml-4' : ''}`}
            >
              &ldquo;{fc.rawValue}&rdquo;
            </p>
          )}
        </td>

        {/* Extracted value */}
        <td className="px-2 py-1.5">
          <span className="font-mono text-[11px] font-semibold text-amber-900">
            {String(value)}
          </span>
          {fc?.interpretation && (
            <p className="text-[9px] leading-tight text-gray-400">
              {fc.interpretation}
            </p>
          )}
        </td>

        {/* Confidence meter + badge */}
        <td className="py-1.5 pl-2 pr-2.5">
          {pct !== null ? (
            <div className="flex items-center justify-end gap-1.5">
              <div
                className={`h-1.5 w-12 overflow-hidden rounded-full ${trackColor}`}
              >
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={`min-w-[26px] text-right text-[10px] font-semibold tabular-nums ${badgeText}`}
              >
                {pct}%
              </span>
            </div>
          ) : (
            <span className="block text-right text-[10px] text-gray-300">
              {'\u2014'}
            </span>
          )}
        </td>
      </tr>

      {/* Expandable alternatives row */}
      {hasAlternatives && expanded && (
        <tr>
          <td
            colSpan={3}
            className="border-b border-amber-100/40 pb-1.5 pl-7 pr-2.5 pt-0"
          >
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[9px] font-medium uppercase tracking-wide text-amber-400">
                Also:
              </span>
              {fc!.alternatives!.map((alt) => (
                <span
                  key={alt}
                  className="rounded-md bg-amber-100/60 px-1.5 py-0.5 text-[9px] text-amber-700 ring-1 ring-inset ring-amber-200/50"
                >
                  {alt}
                </span>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ParsedFieldsTable({ item }: { item: ProgressItem }) {
  const meta = item.metadata as
    | {
        intentId?: string;
        extractedFields?: Record<string, unknown>;
        fieldConfidence?: Record<string, FieldConfidenceData>;
      }
    | undefined;

  const fields = meta?.extractedFields;
  const confidence = meta?.fieldConfidence;
  if (!fields || Object.keys(fields).length === 0) return null;

  const entries = Object.entries(fields).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );

  return (
    <div className="mt-1.5 overflow-hidden rounded-md border border-amber-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200/60 bg-gradient-to-r from-amber-50 to-amber-50/40 px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <svg
            className="h-3 w-3 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
            />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
            AI-Parsed Fields
          </span>
        </div>
        {meta?.intentId && (
          <span className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-[8px] text-amber-400">
            {meta.intentId}
          </span>
        )}
      </div>

      {/* Column headers */}
      <div className="border-b border-amber-100/80 bg-amber-50/30">
        <table className="w-full">
          <thead>
            <tr>
              <th className="py-1 pl-2.5 pr-2 text-left text-[9px] font-medium uppercase tracking-wider text-amber-400/80">
                Field
              </th>
              <th className="px-2 py-1 text-left text-[9px] font-medium uppercase tracking-wider text-amber-400/80">
                Value
              </th>
              <th className="py-1 pl-2 pr-2.5 text-right text-[9px] font-medium uppercase tracking-wider text-amber-400/80">
                Confidence
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Data rows */}
      <table className="w-full">
        <tbody className="divide-y divide-amber-100/50">
          {entries.map(([fieldName, value]) => (
            <ParsedFieldRow
              key={fieldName}
              fieldName={fieldName}
              value={value}
              fc={confidence?.[fieldName]}
            />
          ))}
        </tbody>
      </table>

      {/* Footer: field count summary */}
      <div className="border-t border-amber-100/60 bg-amber-50/20 px-2.5 py-1">
        <span className="text-[9px] text-amber-400">
          {entries.length} field{entries.length !== 1 ? 's' : ''} extracted
        </span>
      </div>
    </div>
  );
}

// --- Validation fields table ---

interface ValidationFieldMeta {
  intentId?: string;
  fieldName?: string;
  fieldDescription?: string;
  fieldType?: string;
  required?: boolean;
  value?: unknown;
  fieldConfidence?: FieldConfidenceData | null;
  resolutionStrategy?: string | null;
}

function ValidationTable({ items }: { items: ProgressItem[] }) {
  if (items.length === 0) return null;

  // Group by intentId
  const grouped = new Map<string, ProgressItem[]>();
  for (const item of items) {
    const meta = item.metadata as ValidationFieldMeta | undefined;
    const key = meta?.intentId ?? 'unknown';
    const arr = grouped.get(key) ?? [];
    arr.push(item);
    grouped.set(key, arr);
  }

  return (
    <>
      {Array.from(grouped.entries()).map(([intentId, fields]) => {
        const requiredFields = fields.filter(
          (f) => (f.metadata as ValidationFieldMeta)?.required,
        );
        const optionalFields = fields.filter(
          (f) => !(f.metadata as ValidationFieldMeta)?.required,
        );
        const requiredPresent = requiredFields.filter(
          (f) => f.status === 'done',
        ).length;
        const requiredTotal = requiredFields.length;
        const allSatisfied = requiredPresent === requiredTotal;

        return (
          <div
            key={intentId}
            className="mt-1.5 overflow-hidden rounded-md border border-indigo-200 bg-white shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-indigo-50/40 px-2.5 py-1.5">
              <div className="flex items-center gap-2">
                <svg
                  className="h-3 w-3 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                  Intent Requirements
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-100/80 px-1.5 py-0.5 font-mono text-[8px] text-indigo-400">
                  {intentId}
                </span>
                <span
                  className={`text-[10px] font-semibold ${allSatisfied ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {requiredPresent}/{requiredTotal} required
                </span>
              </div>
            </div>

            {/* Column headers */}
            <div className="border-b border-indigo-100/80 bg-indigo-50/30">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="w-5 py-1 pl-2.5 pr-0" />
                    <th className="py-1 pl-1 pr-2 text-left text-[9px] font-medium uppercase tracking-wider text-indigo-400/80">
                      Field
                    </th>
                    <th className="px-2 py-1 text-left text-[9px] font-medium uppercase tracking-wider text-indigo-400/80">
                      Value
                    </th>
                    <th className="py-1 pl-2 pr-2.5 text-right text-[9px] font-medium uppercase tracking-wider text-indigo-400/80">
                      Confidence
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Required fields */}
            <table className="w-full">
              <tbody className="divide-y divide-indigo-100/50">
                {requiredFields.map((field) => (
                  <ValidationFieldRow
                    key={field.item}
                    field={field}
                    isRequired
                  />
                ))}
                {optionalFields.map((field) => (
                  <ValidationFieldRow key={field.item} field={field} />
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="border-t border-indigo-100/60 bg-indigo-50/20 px-2.5 py-1">
              <span
                className={`text-[9px] ${allSatisfied ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {allSatisfied
                  ? `\u2713 All ${requiredTotal} required field${requiredTotal !== 1 ? 's' : ''} satisfied`
                  : `\u2717 ${requiredTotal - requiredPresent} required field${requiredTotal - requiredPresent !== 1 ? 's' : ''} missing`}
                {optionalFields.length > 0 &&
                  ` \u00B7 ${optionalFields.length} optional provided`}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}

function ValidationFieldRow({
  field,
  isRequired = false,
}: {
  field: ProgressItem;
  isRequired?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = field.metadata as ValidationFieldMeta | undefined;
  const fc = meta?.fieldConfidence;
  const pct = fc ? Math.round(fc.confidence * 100) : null;
  const hasAlternatives = !!(fc?.alternatives && fc.alternatives.length > 0);
  const isMissing = field.status === 'failed';

  const badgeText =
    pct === null
      ? 'text-gray-400'
      : pct >= 90
        ? 'text-emerald-600'
        : pct >= 70
          ? 'text-blue-600'
          : pct >= 50
            ? 'text-amber-600'
            : 'text-red-600';
  const barColor =
    pct === null
      ? 'bg-gray-300'
      : pct >= 90
        ? 'bg-emerald-500'
        : pct >= 70
          ? 'bg-blue-500'
          : pct >= 50
            ? 'bg-amber-500'
            : 'bg-red-500';
  const trackColor =
    pct === null
      ? 'bg-gray-100'
      : pct >= 90
        ? 'bg-emerald-100'
        : pct >= 70
          ? 'bg-blue-100'
          : pct >= 50
            ? 'bg-amber-100'
            : 'bg-red-100';

  return (
    <>
      <tr
        className={`group transition-colors hover:bg-indigo-50/60 ${hasAlternatives ? 'cursor-pointer' : ''}`}
        onClick={hasAlternatives ? () => setExpanded(!expanded) : undefined}
      >
        {/* Status icon */}
        <td className="w-5 py-1.5 pl-2.5 pr-0 text-center">
          {isMissing ? (
            <span className="text-[10px] text-red-500">{'\u2717'}</span>
          ) : (
            <span className="text-[10px] text-emerald-500">{'\u2713'}</span>
          )}
        </td>

        {/* Field name */}
        <td className="py-1.5 pl-1 pr-2">
          <div className="flex items-center gap-1.5">
            {hasAlternatives && (
              <svg
                className={`h-2.5 w-2.5 flex-shrink-0 text-amber-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            )}
            <span className="text-[11px] font-medium text-indigo-800">
              {FIELD_LABELS[meta?.fieldName ?? ''] ?? meta?.fieldName}
            </span>
            <span
              className={`rounded px-1 py-0.5 text-[8px] font-semibold uppercase ${
                isRequired
                  ? 'bg-indigo-100 text-indigo-500'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isRequired ? 'req' : 'opt'}
            </span>
          </div>
          {meta?.fieldDescription && (
            <p className="text-[9px] text-indigo-400/70">
              {meta.fieldDescription}
            </p>
          )}
          {fc?.rawValue && (
            <p className="text-[9px] text-indigo-500/70">
              &ldquo;{fc.rawValue}&rdquo;
            </p>
          )}
        </td>

        {/* Value */}
        <td className="px-2 py-1.5">
          {isMissing ? (
            <span className="text-[11px] font-medium text-red-500">
              Not provided
            </span>
          ) : (
            <>
              <span className="font-mono text-[11px] font-semibold text-indigo-900">
                {String(meta?.value ?? field.detail)}
              </span>
              {fc?.interpretation && (
                <p className="text-[9px] leading-tight text-gray-400">
                  {'\u2192'} {fc.interpretation}
                </p>
              )}
              {meta?.resolutionStrategy && (
                <p className="text-[9px] text-violet-400">
                  needs {meta.resolutionStrategy} resolution
                </p>
              )}
            </>
          )}
        </td>

        {/* Confidence */}
        <td className="py-1.5 pl-2 pr-2.5">
          {pct !== null ? (
            <div className="flex items-center justify-end gap-1.5">
              <div
                className={`h-1.5 w-12 overflow-hidden rounded-full ${trackColor}`}
              >
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={`min-w-[26px] text-right text-[10px] font-semibold tabular-nums ${badgeText}`}
              >
                {pct}%
              </span>
            </div>
          ) : (
            <span className="block text-right text-[10px] text-gray-300">
              {'\u2014'}
            </span>
          )}
        </td>
      </tr>

      {/* Expandable alternatives */}
      {hasAlternatives && expanded && (
        <tr>
          <td colSpan={4} className="pb-1.5 pl-8 pr-2.5 pt-0">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[9px] font-medium uppercase tracking-wide text-amber-500">
                Alternatives:
              </span>
              {fc!.alternatives!.map((alt) => (
                <span
                  key={alt}
                  className="rounded-md bg-amber-100/60 px-1.5 py-0.5 text-[9px] text-amber-700 ring-1 ring-inset ring-amber-200/50"
                >
                  {alt}
                </span>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function formatSapErrorExplanation(meta: Record<string, unknown>): string {
  const code = typeof meta.errorCode === 'string' ? meta.errorCode : '';
  const status = typeof meta.httpStatus === 'number' ? meta.httpStatus : 0;
  const msg = typeof meta.error === 'string' ? meta.error : '';

  // Translate well-known SAP error codes into plain English
  if (code === '/IWBEP/CM_MGW_RT/020' || msg.includes('Resource not found')) {
    return 'SAP confirmed this purchase order number does not exist in the system. Double-check the PO number for typos or verify it was created in the connected SAP client.';
  }
  if (code === 'SY/530') {
    return 'SAP could not locate the requested resource. The PO may have been deleted or the number may be incorrect.';
  }
  if (code === 'NETWORK_ERROR' || code === 'UNKNOWN_ERROR') {
    return 'Could not reach SAP to verify this PO. This may be a temporary connectivity issue — try again shortly.';
  }
  if (status === 401 || status === 403) {
    return 'The SAP service user does not have permission to look up this purchase order. Contact your SAP administrator.';
  }
  if (status === 503 || status === 502 || status === 504) {
    return 'SAP is temporarily unavailable. The system may be under maintenance — try again in a few minutes.';
  }
  if (msg) {
    return `SAP returned an error while verifying this PO: "${msg}"`;
  }
  return 'The purchase order could not be verified. Check that the PO number is correct and exists in the connected SAP system.';
}

function formatSapErrorMessage(meta: Record<string, unknown>): string {
  if (
    typeof meta.error === 'object' &&
    meta.error !== null &&
    'message' in (meta.error as Record<string, unknown>)
  ) {
    return String((meta.error as Record<string, string>).message);
  }
  return String(meta.error);
}

function PoNotFoundCard({ item }: { item: ProgressItem }) {
  const [showDetails, setShowDetails] = useState(false);
  const meta = item.metadata as Record<string, unknown> | undefined;
  const hasError = meta?.error != null;
  const explanation = meta
    ? formatSapErrorExplanation(meta)
    : 'The purchase order could not be verified. Check that the PO number is correct and exists in the connected SAP system.';

  return (
    <div className="rounded border border-red-200 bg-red-50/50">
      <div className="flex items-center justify-between border-b border-red-200/60 px-2.5 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
          PO Validation Failed
        </span>
        <span className="flex items-center gap-1 text-[10px] font-medium text-red-500">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          Not Found
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-xs font-medium text-red-700">
          PO {item.originalValue} does not exist in SAP
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-red-600/80">
          {explanation}
        </p>
        {hasError && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="flex items-center gap-1 text-[10px] font-medium text-red-400 transition-colors hover:text-red-500"
            >
              <svg
                className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
              Technical details
            </button>
            {showDetails && meta && (
              <div className="mt-1.5 rounded bg-red-100/60 px-2 py-1.5 font-mono text-[9px] leading-relaxed text-red-500">
                <div>
                  <span className="text-red-400">Message: </span>
                  {formatSapErrorMessage(meta)}
                </div>
                {meta.errorCode != null && (
                  <div>
                    <span className="text-red-400">SAP Code: </span>
                    {String(meta.errorCode)}
                  </div>
                )}
                {meta.httpStatus != null && (
                  <div>
                    <span className="text-red-400">HTTP Status: </span>
                    {String(meta.httpStatus)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function POValidationCard({ item }: { item: ProgressItem }) {
  const poHeader = (item.metadata?.poHeader ?? item.metadata) as
    | POHeaderMeta
    | undefined;
  const exists = item.metadata?.exists as boolean | undefined;
  const isValid = exists === true && item.status === 'done';

  return (
    <div className="mt-1.5 space-y-1.5">
      {/* Queried from SAP */}
      {isValid && poHeader ? (
        <div className="rounded border border-emerald-200 bg-emerald-50/50">
          <div className="flex items-center justify-between border-b border-emerald-200/60 px-2.5 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              Verified from SAP
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Validated
            </span>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 px-2.5 py-2">
            <DataCell label="Supplier" value={poHeader.supplier} />
            <DataCell label="Company" value={poHeader.companyCode} />
            <DataCell label="Type" value={poHeader.orderType} />
            <DataCell label="Currency" value={poHeader.currency} />
            <DataCell label="Purch. Org" value={poHeader.purchasingOrg} />
            <DataCell label="Purch. Group" value={poHeader.purchasingGroup} />
            <DataCell label="Payment" value={poHeader.paymentTerms} />
            <DataCell label="Items" value={String(poHeader.totalItems)} />
            <DataCell label="Created by" value={poHeader.createdBy} />
          </div>
          {poHeader.isDeleted && (
            <div className="border-t border-red-200 bg-red-50 px-2.5 py-1">
              <span className="text-[10px] font-semibold uppercase text-red-600">
                Deletion flag set
              </span>
            </div>
          )}
        </div>
      ) : item.status === 'running' ? (
        <div className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50/40 px-2.5 py-2">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          <span className="text-xs text-blue-600">Querying SAP...</span>
        </div>
      ) : (
        <PoNotFoundCard item={item} />
      )}
    </div>
  );
}

// --- Corroboration sub-components ---

const SIGNAL_RESULT_STYLES: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
  match: {
    icon: '\u2713',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 ring-emerald-200/60',
  },
  mismatch: {
    icon: '\u2717',
    color: 'text-red-700',
    bg: 'bg-red-50 ring-red-200/60',
  },
  partial: {
    icon: '\u2248',
    color: 'text-amber-700',
    bg: 'bg-amber-50 ring-amber-200/60',
  },
  unavailable: {
    icon: '\u2014',
    color: 'text-gray-400',
    bg: 'bg-gray-50 ring-gray-200/60',
  },
};

function CorroborationSignalRow({ signal }: { signal: CorroborationSignal }) {
  const style =
    SIGNAL_RESULT_STYLES[signal.result] ?? SIGNAL_RESULT_STYLES.unavailable;

  return (
    <div
      className={`flex items-start gap-2 rounded-md px-2 py-1.5 ring-1 ring-inset ${style.bg}`}
    >
      <span className={`mt-px text-xs font-bold ${style.color}`}>
        {style.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide ${style.color}`}
          >
            {signal.label}
          </span>
          {signal.result !== 'unavailable' && (
            <span className="text-[9px] text-gray-400">
              weight {Math.round(signal.weight * 100)}%
            </span>
          )}
        </div>
        {signal.result !== 'unavailable' ? (
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
            <span className="font-mono text-gray-600">
              &ldquo;{signal.userClaim}&rdquo;
            </span>
            <span className="text-gray-300">&harr;</span>
            <span className="font-mono text-gray-600">
              {signal.sapValue}
            </span>
          </div>
        ) : (
          <p className="mt-0.5 text-[10px] text-gray-400">
            {signal.explanation}
          </p>
        )}
      </div>
    </div>
  );
}

function ConfidenceEvolution({
  corroboration,
}: {
  corroboration: CorroborationResult;
}) {
  const initialPct = Math.round(corroboration.initialConfidence * 100);
  const finalPct = Math.round(corroboration.finalConfidence * 100);
  const delta = finalPct - initialPct;
  const improved = delta > 0;

  const finalColor =
    finalPct >= 90
      ? 'text-emerald-700'
      : finalPct >= 70
        ? 'text-blue-700'
        : finalPct >= 50
          ? 'text-amber-700'
          : 'text-red-700';
  const finalBarColor =
    finalPct >= 90
      ? 'bg-emerald-500'
      : finalPct >= 70
        ? 'bg-blue-500'
        : finalPct >= 50
          ? 'bg-amber-500'
          : 'bg-red-500';
  const finalTrackColor =
    finalPct >= 90
      ? 'bg-emerald-100'
      : finalPct >= 70
        ? 'bg-blue-100'
        : finalPct >= 50
          ? 'bg-amber-100'
          : 'bg-red-100';

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-400">{initialPct}%</span>
      <svg
        className="h-3 w-3 flex-shrink-0 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
        />
      </svg>
      <div className="flex items-center gap-1.5">
        <div
          className={`h-1.5 w-12 overflow-hidden rounded-full ${finalTrackColor}`}
        >
          <div
            className={`h-full rounded-full transition-all ${finalBarColor}`}
            style={{ width: `${finalPct}%` }}
          />
        </div>
        <span className={`text-xs font-bold tabular-nums ${finalColor}`}>
          {finalPct}%
        </span>
      </div>
      {delta !== 0 && (
        <span
          className={`text-[10px] font-semibold ${improved ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {improved ? '+' : ''}
          {delta}%
        </span>
      )}
    </div>
  );
}

function CorroborationPanel({
  corroboration,
}: {
  corroboration: CorroborationResult;
}) {
  const [expanded, setExpanded] = useState(false);
  const availableSignals = corroboration.signals.filter(
    (s) => s.result !== 'unavailable',
  );
  const unavailableSignals = corroboration.signals.filter(
    (s) => s.result === 'unavailable',
  );

  return (
    <div className="mt-2 rounded-md border border-indigo-200/60 bg-indigo-50/30">
      <button
        type="button"
        className="flex w-full items-center justify-between px-2.5 py-1.5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-3 w-3 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
            />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
            Corroboration
          </span>
          <span className="text-[10px] text-indigo-400">
            {corroboration.matchCount}/{corroboration.signalCount} signals
            matched
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceEvolution corroboration={corroboration} />
          <svg
            className={`h-3 w-3 text-indigo-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-indigo-200/40 px-2.5 py-2 space-y-1.5">
          {availableSignals.map((s) => (
            <CorroborationSignalRow key={s.id} signal={s} />
          ))}
          {unavailableSignals.length > 0 && (
            <div className="pt-1">
              <p className="mb-1 text-[9px] font-medium uppercase text-gray-400">
                Insufficient data
              </p>
              {unavailableSignals.map((s) => (
                <CorroborationSignalRow key={s.id} signal={s} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Item Resolution Card (3-tier: Hero → Confidence → Supporting Data) ---

function ItemResolutionCard({ item }: { item: ProgressItem }) {
  const isResolved = item.status === 'done';
  const isFailed = item.status === 'failed';
  const meta = item.metadata as Record<string, unknown> | undefined;
  const corroboration = item.corroboration;

  // Use corroborated confidence if available, otherwise fall back to match confidence
  const hasCorroboration = !!(corroboration && corroboration.signalCount > 0);
  const finalPct = hasCorroboration
    ? Math.round(corroboration.finalConfidence * 100)
    : null;

  const borderColor = isResolved
    ? hasCorroboration && finalPct! >= 80
      ? 'border-emerald-200'
      : 'border-blue-200'
    : isFailed
      ? 'border-red-200'
      : 'border-slate-200';
  const bgColor = isResolved
    ? hasCorroboration && finalPct! >= 80
      ? 'bg-emerald-50/30'
      : 'bg-blue-50/40'
    : isFailed
      ? 'bg-red-50/40'
      : 'bg-slate-50/40';

  return (
    <div className={`mt-1.5 rounded-lg border ${borderColor} ${bgColor}`}>
      {/* ---- Tier 1: Hero — Resolution result ---- */}
      <div className="px-3 pt-2.5 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              isResolved
                ? 'text-blue-600'
                : isFailed
                  ? 'text-red-600'
                  : 'text-slate-500'
            }`}
          >
            Item Resolution
          </span>
          <div className="flex items-center gap-1.5">
            {item.matchType && (
              <MatchBadge
                matchType={item.matchType}
                confidence={item.confidence}
              />
            )}
          </div>
        </div>

        {/* Search → Result */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-amber-700">
            &ldquo;{item.parseConfidence?.rawValue ?? item.originalValue}&rdquo;
          </span>
          <svg
            className={`h-3 w-3 flex-shrink-0 ${isResolved ? 'text-blue-400' : 'text-gray-300'}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
          {isResolved ? (
            <span className="font-mono font-medium text-blue-800">
              {item.resolvedValue && `Item ${item.resolvedValue}`}
              {meta?.description ? ` \u2014 ${String(meta.description)}` : ''}
            </span>
          ) : isFailed ? (
            <span className="text-red-600">{item.detail}</span>
          ) : (
            <span className="text-slate-500">Resolving...</span>
          )}
        </div>

        {item.parseConfidence && (
          <div className="mt-1">
            <ParseConfidenceBadge fc={item.parseConfidence} />
          </div>
        )}
      </div>

      {/* ---- Tier 2: Confidence Story — Corroboration ---- */}
      {isResolved && hasCorroboration && (
        <div className="px-3 pb-2">
          <CorroborationPanel corroboration={corroboration!} />
        </div>
      )}

      {/* ---- Tier 3: Supporting Data — SAP metadata ---- */}
      {isResolved &&
        meta &&
        !!(meta.quantity || meta.netPrice || meta.plant || meta.material || meta.description || meta.deliveryDate) && (
          <div
            className={`border-t px-3 py-2 ${
              hasCorroboration && finalPct! >= 80
                ? 'border-emerald-200/40'
                : 'border-blue-200/40'
            }`}
          >
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              SAP Item Data
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
              {!!meta.description && (
                <span>
                  <span className="text-gray-400">Description</span>{' '}
                  <span className="font-mono font-medium text-gray-700">
                    {String(meta.description)}
                  </span>
                </span>
              )}
              {meta.quantity !== undefined && meta.quantity !== 0 && (
                <span>
                  <span className="text-gray-400">Qty</span>{' '}
                  <span className="font-mono font-medium text-gray-700">
                    {String(meta.quantity)} {String(meta.unit ?? '')}
                  </span>
                </span>
              )}
              {meta.netPrice !== undefined && meta.netPrice !== 0 && (
                <span>
                  <span className="text-gray-400">Price</span>{' '}
                  <span className="font-mono font-medium text-gray-700">
                    {String(meta.netPrice)} {String(meta.currency ?? '')}
                  </span>
                </span>
              )}
              {!!meta.plant && (
                <span>
                  <span className="text-gray-400">Plant</span>{' '}
                  <span className="font-mono font-medium text-gray-700">
                    {String(meta.plant)}
                  </span>
                </span>
              )}
              {!!meta.material && (
                <span>
                  <span className="text-gray-400">Material</span>{' '}
                  <span className="font-mono font-medium text-gray-700">
                    {String(meta.material)}
                  </span>
                </span>
              )}
              {!!meta.deliveryDate && (
                <span>
                  <span className="text-gray-400">Delivery</span>{' '}
                  <span className="font-mono font-medium text-gray-700">
                    {String(meta.deliveryDate)}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}

      {/* Candidates for ambiguous matches */}
      {item.candidates && item.candidates.length > 0 && (
        <div className="border-t border-amber-200/40 px-3 py-2 space-y-1">
          <span className="text-[10px] font-medium uppercase text-amber-600">
            Multiple matches — disambiguation needed
          </span>
          {item.candidates.map((c) => (
            <div
              key={c.resolvedValue}
              className="flex items-center gap-2 rounded border border-amber-200/60 bg-amber-50/40 px-2 py-1 text-xs"
            >
              <span className="font-mono font-medium text-amber-800">
                {c.resolvedValue}
              </span>
              <span className="text-amber-600">{c.resolvedLabel}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DataCell({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <span className="text-[10px] text-emerald-500">{label}</span>
      <span className="ml-1.5 font-mono text-[11px] font-medium text-emerald-900">
        {value}
      </span>
    </div>
  );
}

function MatchBadge({
  matchType,
  confidence,
}: {
  matchType: string;
  confidence?: string;
}) {
  const styles: Record<string, string> = {
    exact_text: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    substring: 'bg-blue-100 text-blue-700 ring-blue-200',
    numeric_pad: 'bg-violet-100 text-violet-700 ring-violet-200',
    fuzzy: 'bg-amber-100 text-amber-700 ring-amber-200',
    po_lookup: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
    none: 'bg-gray-100 text-gray-500 ring-gray-200',
  };
  const labels: Record<string, string> = {
    exact_text: 'exact match',
    substring: 'substring',
    numeric_pad: 'numeric',
    fuzzy: 'fuzzy match',
    po_lookup: 'SAP lookup',
    none: 'no match',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ring-inset ${styles[matchType] ?? styles.none}`}
    >
      {labels[matchType] ?? matchType}
      {confidence && confidence !== 'exact' && confidence !== 'high' && (
        <span className="opacity-60">{confidence}</span>
      )}
    </span>
  );
}

// --- Simple progress items (connectivity, intent summaries) ---

function SimpleProgressItem({ item }: { item: ProgressItem }) {
  return (
    <li className="flex items-center gap-1.5 text-xs">
      <span className="w-3 flex-shrink-0 text-center">
        {item.status === 'done' ? (
          <span className="text-emerald-500">&#10003;</span>
        ) : item.status === 'failed' ? (
          <span className="text-red-500">&#10005;</span>
        ) : (
          <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border border-blue-300 border-t-blue-600" />
        )}
      </span>
      <span
        className={
          item.status === 'done'
            ? 'text-gray-600'
            : item.status === 'failed'
              ? 'text-red-600'
              : 'text-blue-600'
        }
      >
        {item.detail}
      </span>
    </li>
  );
}

// --- API Call Trace ---

const TRACE_METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-emerald-100 text-emerald-700',
  PATCH: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-red-100 text-red-700',
  CACHE: 'bg-violet-100 text-violet-700',
};

const TRACE_STATUS_COLORS: Record<string, string> = {
  success: 'text-emerald-600',
  miss: 'text-amber-600',
  error: 'text-red-600',
};

const TRACE_STATUS_ICONS: Record<string, string> = {
  success: '\u2713',
  miss: '\u2717',
  error: '\u2717',
};

function ApiTraceLog({ items }: { items: ProgressItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 3);
  const hiddenCount = items.length - 3;

  return (
    <div className="mt-1.5 overflow-hidden rounded-md border border-slate-200 bg-slate-50/50">
      <div className="flex items-center justify-between border-b border-slate-200/60 bg-slate-50 px-2.5 py-1">
        <div className="flex items-center gap-1.5">
          <svg
            className="h-3 w-3 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            API Calls ({items.length})
          </span>
        </div>
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-medium text-blue-500 hover:text-blue-700"
          >
            {expanded ? 'Collapse' : `+${hiddenCount} more`}
          </button>
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {visibleItems.map((item) => {
          const meta = item.metadata as
            | {
                method?: string;
                path?: string;
                callStatus?: string;
                durationMs?: number;
              }
            | undefined;
          const method = meta?.method ?? 'GET';
          const path = meta?.path ?? '';
          const callStatus = meta?.callStatus ?? 'success';
          const durationMs = meta?.durationMs;

          return (
            <div
              key={item.item}
              className="flex items-center gap-2 px-2.5 py-1.5"
            >
              <span
                className={`shrink-0 rounded px-1 py-0.5 font-mono text-[9px] font-bold ${TRACE_METHOD_COLORS[method] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {method}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-600">
                {path}
              </span>
              <span
                className={`shrink-0 text-[10px] font-semibold ${TRACE_STATUS_COLORS[callStatus] ?? 'text-gray-400'}`}
              >
                {TRACE_STATUS_ICONS[callStatus] ?? '?'} {callStatus}
              </span>
              {durationMs !== undefined && (
                <span className="shrink-0 text-[9px] tabular-nums text-slate-400">
                  {durationMs}ms
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Decomposer stage components ---

const CHANGE_TYPE_LABELS: Record<string, string> = {
  absolute: 'absolute',
  relative_increase: '+increase',
  relative_decrease: '-decrease',
  percentage: '%',
  multiply: 'multiply',
};

function DecomposedSpecCard({ item }: { item: ProgressItem }) {
  const meta = item.metadata as
    | {
        targetEntity?: string;
        fieldChanges?: Array<{
          field: string;
          originalValue?: string;
          newValue: string;
          changeType: string;
          rawExpression: string;
          unit?: string;
          confidence: number;
        }>;
        materialHint?: string;
      }
    | undefined;

  if (!meta?.fieldChanges) return null;

  return (
    <div className="mt-1.5 overflow-hidden rounded-md border border-cyan-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-cyan-200/60 bg-gradient-to-r from-cyan-50 to-cyan-50/40 px-2.5 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-700">
          Change Specification
        </span>
        <div className="flex items-center gap-2">
          {meta.materialHint && (
            <span className="rounded bg-cyan-100/80 px-1.5 py-0.5 text-[9px] font-medium text-cyan-600">
              {meta.materialHint}
            </span>
          )}
          <span className="font-mono text-[10px] font-semibold text-cyan-800">
            {meta.targetEntity}
          </span>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-cyan-100/60 bg-cyan-50/30">
            <th className="py-1 pl-2.5 pr-2 text-left text-[9px] font-medium uppercase text-cyan-500">
              Field
            </th>
            <th className="px-2 py-1 text-left text-[9px] font-medium uppercase text-cyan-500">
              Change
            </th>
            <th className="px-2 py-1 text-left text-[9px] font-medium uppercase text-cyan-500">
              Type
            </th>
            <th className="py-1 pl-2 pr-2.5 text-right text-[9px] font-medium uppercase text-cyan-500">
              Conf
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cyan-100/50">
          {meta.fieldChanges.map((fc) => (
            <tr key={`${fc.field}-${fc.newValue}`}>
              <td className="py-1.5 pl-2.5 pr-2 text-[11px] font-medium text-cyan-800">
                {FIELD_LABELS[fc.field] ?? fc.field}
              </td>
              <td className="px-2 py-1.5">
                {fc.originalValue && (
                  <span className="mr-1.5 text-[10px] text-gray-400 line-through">
                    {fc.originalValue}
                  </span>
                )}
                {fc.originalValue && (
                  <span className="mr-1 text-[10px] text-gray-400">&rarr;</span>
                )}
                <span className="font-mono text-[11px] font-semibold text-cyan-900">
                  {fc.newValue}
                  {fc.unit ? ` ${fc.unit}` : ''}
                </span>
              </td>
              <td className="px-2 py-1.5">
                <span className="rounded bg-cyan-100/80 px-1 py-0.5 text-[8px] font-medium text-cyan-600">
                  {CHANGE_TYPE_LABELS[fc.changeType] ?? fc.changeType}
                </span>
              </td>
              <td className="py-1.5 pl-2 pr-2.5 text-right">
                <span
                  className={`text-[10px] font-semibold ${
                    fc.confidence >= 0.9
                      ? 'text-emerald-600'
                      : fc.confidence >= 0.7
                        ? 'text-blue-600'
                        : 'text-amber-600'
                  }`}
                >
                  {Math.round(fc.confidence * 100)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuantityAnalysisCard({ item }: { item: ProgressItem }) {
  const meta = item.metadata as
    | {
        quantities?: Array<{
          role: string;
          value: number;
          context: string;
        }>;
        mathCheck?: string;
      }
    | undefined;

  if (!meta?.quantities || meta.quantities.length === 0) return null;

  const ROLE_COLORS: Record<string, string> = {
    original: 'bg-slate-100 text-slate-700',
    delivered: 'bg-blue-100 text-blue-700',
    target: 'bg-emerald-100 text-emerald-700',
    remaining: 'bg-amber-100 text-amber-700',
    adjustment: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="mt-1.5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-50/40 px-2.5 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Quantity Analysis
        </span>
      </div>
      <div className="flex flex-wrap gap-2 px-2.5 py-2">
        {meta.quantities.map((q) => (
          <div
            key={`${q.role}-${q.value}`}
            className="flex items-center gap-1.5 rounded-md border border-slate-200/60 bg-slate-50/50 px-2 py-1"
            title={q.context}
          >
            <span
              className={`rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase ${ROLE_COLORS[q.role] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {q.role}
            </span>
            <span className="font-mono text-[11px] font-semibold text-slate-800">
              {q.value}
            </span>
          </div>
        ))}
      </div>
      {meta.mathCheck && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-2.5 py-1.5">
          <span className="text-[10px] text-slate-500">{meta.mathCheck}</span>
        </div>
      )}
    </div>
  );
}

function DecomposerWarning({ item }: { item: ProgressItem }) {
  return (
    <div className="mt-1.5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/50 px-2.5 py-1.5">
      <span className="mt-0.5 text-amber-500">&#9888;</span>
      <span className="text-[11px] text-amber-800">{item.detail}</span>
    </div>
  );
}

// --- Guard violation card (business rules engine results) ---

function GuardViolationCard({ item }: { item: ProgressItem }) {
  const meta = item.metadata ?? {};
  const severity = (meta.severity as string) ?? 'info';
  const ruleId = (meta.ruleId as string) ?? '';
  const suggestedFix = meta.suggestedFix as string | undefined;
  const field = meta.field as string | undefined;
  const currentValue = meta.currentValue;
  const sapValue = meta.sapValue;

  const borderColor =
    severity === 'block'
      ? 'border-red-300'
      : severity === 'warn'
        ? 'border-amber-300'
        : 'border-blue-200';
  const bgColor =
    severity === 'block'
      ? 'bg-red-50/60'
      : severity === 'warn'
        ? 'bg-amber-50/50'
        : 'bg-blue-50/50';
  const iconColor =
    severity === 'block'
      ? 'text-red-500'
      : severity === 'warn'
        ? 'text-amber-500'
        : 'text-blue-400';
  const icon =
    severity === 'block' ? '\u26D4' : severity === 'warn' ? '\u26A0' : '\u2139';
  const labelColor =
    severity === 'block'
      ? 'text-red-700'
      : severity === 'warn'
        ? 'text-amber-700'
        : 'text-blue-700';
  const badgeColors =
    severity === 'block'
      ? 'bg-red-100 text-red-700 ring-red-200'
      : severity === 'warn'
        ? 'bg-amber-100 text-amber-700 ring-amber-200'
        : 'bg-blue-100 text-blue-700 ring-blue-200';

  return (
    <div
      className={`mt-1.5 rounded-md border ${borderColor} ${bgColor} px-2.5 py-2`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 ${iconColor}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${badgeColors}`}
            >
              {severity.toUpperCase()}
            </span>
            <span className={`text-[11px] font-medium ${labelColor}`}>
              {ruleId}
            </span>
            {field && (
              <span className="text-[10px] text-gray-400">
                field: {field}
              </span>
            )}
          </div>
          <p className={`mt-0.5 text-[11px] ${labelColor}`}>{item.detail}</p>
          {(currentValue !== undefined || sapValue !== undefined) && (
            <div className="mt-1 flex gap-3 text-[10px] text-gray-500">
              {currentValue !== undefined && (
                <span>
                  Requested: <strong>{String(currentValue)}</strong>
                </span>
              )}
              {sapValue !== undefined && (
                <span>
                  SAP current: <strong>{String(sapValue)}</strong>
                </span>
              )}
            </div>
          )}
          {suggestedFix && (
            <p className="mt-1 text-[10px] italic text-gray-500">
              {suggestedFix}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GuardChecksTable({ items }: { items: ProgressItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const passedCount = items.filter((p) => p.metadata?.passed).length;
  const failedCount = items.length - passedCount;

  return (
    <div className="mt-1.5 rounded-md border border-gray-200 bg-gray-50/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-[11px]"
      >
        <span className="font-medium text-gray-600">
          {items.length} rules evaluated
          {failedCount > 0 ? (
            <span className="ml-1.5 text-red-600">
              ({failedCount} failed, {passedCount} passed)
            </span>
          ) : (
            <span className="ml-1.5 text-emerald-600">
              (all passed)
            </span>
          )}
        </span>
        <span className="text-gray-400">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>
      {expanded && (
        <div className="border-t border-gray-200 px-2.5 py-1.5">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="w-5 pb-1"></th>
                <th className="pb-1 font-medium">Rule</th>
                <th className="pb-1 font-medium">Description</th>
                <th className="pb-1 font-medium">Intent</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const meta = p.metadata ?? {};
                const passed = meta.passed as boolean;
                const severity = meta.severity as string | undefined;
                return (
                  <tr
                    key={p.item}
                    className={
                      passed
                        ? 'text-gray-500'
                        : severity === 'block'
                          ? 'text-red-700'
                          : 'text-amber-700'
                    }
                  >
                    <td className="py-0.5 text-center">
                      {passed ? (
                        <span className="text-emerald-500">&#10003;</span>
                      ) : severity === 'block' ? (
                        <span className="text-red-500">&#10005;</span>
                      ) : (
                        <span className="text-amber-500">&#9888;</span>
                      )}
                    </td>
                    <td className="py-0.5 font-mono">
                      {(meta.ruleId as string) ?? ''}
                    </td>
                    <td className="py-0.5">{p.detail}</td>
                    <td className="py-0.5 font-mono text-gray-400">
                      {(meta.intentId as string) ?? ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GuardSummaryCard({ item }: { item: ProgressItem }) {
  return (
    <div className="mt-1.5 flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50/50 px-2.5 py-1.5">
      <span className="text-[11px] leading-none text-emerald-500">&#10003;</span>
      <span className="text-[11px] text-emerald-700">{item.detail}</span>
    </div>
  );
}

// --- Main component ---

export function PipelineProgress({
  currentStage,
  completedStages,
  stageDetails = [],
  progressItems = {},
  error,
}: PipelineProgressProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Pipeline Progress
      </p>
      <div className="space-y-0">
        {STAGES.map(({ key, label }, stageIdx) => {
          const isCompleted = completedStages.includes(key);
          const isCurrent = currentStage === key;
          const hasError = error && isCurrent;
          const detail = stageDetails.find((d) => d.stage === key);
          // Show separator between stages that have content
          const showSeparator =
            stageIdx > 0 && (isCompleted || isCurrent || hasError);
          const detailText = isCompleted
            ? detail?.completedDetail
            : isCurrent && !hasError
              ? detail?.startedDetail
              : undefined;

          const items = progressItems[key] ?? [];

          // Separate entity items from simple progress items
          const parsedFieldItems = items.filter(
            (p) => p.entityType === 'parsedFields',
          );
          const validationItems = items.filter(
            (p) => p.entityType === 'validationField',
          );
          const traceItems = items.filter((p) => p.entityType === 'apiTrace');
          const entityItems = items.filter(
            (p) =>
              p.entityType === 'purchaseOrder' ||
              p.entityType === 'purchaseOrderItem',
          );
          const decomposedItems = items.filter(
            (p) =>
              p.entityType === 'decomposedSpec' ||
              p.entityType === 'quantityAnalysis' ||
              p.entityType === 'decomposerWarning',
          );
          const guardCheckItems = items.filter(
            (p) => p.entityType === 'guardCheck',
          );
          const guardItems = items.filter(
            (p) =>
              p.entityType === 'guardViolation' ||
              p.entityType === 'guardSummary',
          );
          const simpleItems = items.filter(
            (p) =>
              !p.entityType ||
              ![
                'parsedFields',
                'validationField',
                'apiTrace',
                'purchaseOrder',
                'purchaseOrderItem',
                'decomposedSpec',
                'quantityAnalysis',
                'decomposerWarning',
                'guardCheck',
                'guardViolation',
                'guardSummary',
              ].includes(p.entityType),
          );

          return (
            <div key={key} className="py-1">
              {showSeparator && (
                <hr className="mb-1.5 ml-7 border-t border-gray-100" />
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="w-5 text-center">
                  {hasError ? (
                    <span className="text-red-500">&#10005;</span>
                  ) : isCompleted ? (
                    <span className="text-emerald-500">&#10003;</span>
                  ) : isCurrent ? (
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                  ) : (
                    <span className="text-gray-300">&#9679;</span>
                  )}
                </span>
                <span
                  className={
                    hasError
                      ? 'font-medium text-red-600'
                      : isCompleted
                        ? 'font-medium text-emerald-700'
                        : isCurrent
                          ? 'font-medium text-blue-700'
                          : 'text-gray-400'
                  }
                >
                  {label}
                </span>
              </div>
              {hasError && (
                <div className="ml-7 mt-1 rounded-md border border-red-200 bg-red-50/60 px-2.5 py-2">
                  {detail?.startedDetail && (
                    <p className="text-[11px] text-gray-500">
                      {detail.startedDetail}
                    </p>
                  )}
                  {error && (
                    <div className="mt-0.5">
                      {error.split(' — ').map((segment, i) => (
                        <p
                          key={i}
                          className={
                            i === 0
                              ? 'text-xs font-medium text-red-700'
                              : 'mt-0.5 text-[11px] text-red-500'
                          }
                        >
                          {i > 0 && (
                            <span className="mr-1 text-red-300">hint:</span>
                          )}
                          {segment}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {detailText && (
                <p
                  className={`ml-7 text-xs ${
                    isCompleted
                      ? 'text-emerald-600'
                      : isCurrent
                        ? 'text-blue-600'
                        : 'text-gray-400'
                  }`}
                >
                  {detailText}
                </p>
              )}
              {isCompleted && detail?.costEstimate && (
                <p className="ml-7 text-[10px] text-gray-400">
                  {'\u21B3'} {detail.costEstimate.inputTokens.toLocaleString()}{' '}
                  in{' \u00B7 '}
                  {detail.costEstimate.outputTokens.toLocaleString()} out
                  {' \u00B7 '}
                  {detail.costEstimate.model}
                  {' \u00B7 '}${detail.costEstimate.totalCost.toFixed(4)}
                </p>
              )}

              {/* Simple progress items (connectivity check, intent summary) */}
              {simpleItems.length > 0 && (
                <ul className="ml-7 mt-1 space-y-0.5">
                  {simpleItems.map((p) => (
                    <SimpleProgressItem key={p.item} item={p} />
                  ))}
                </ul>
              )}

              {/* Decomposed specifications (pre-analysis of complex messages) */}
              {decomposedItems.length > 0 && (
                <div className="ml-7">
                  {decomposedItems.map((p) =>
                    p.entityType === 'decomposedSpec' ? (
                      <DecomposedSpecCard key={p.item} item={p} />
                    ) : p.entityType === 'quantityAnalysis' ? (
                      <QuantityAnalysisCard key={p.item} item={p} />
                    ) : p.entityType === 'decomposerWarning' ? (
                      <DecomposerWarning key={p.item} item={p} />
                    ) : null,
                  )}
                </div>
              )}

              {/* Parsed fields table (what the AI extracted) */}
              {parsedFieldItems.length > 0 && (
                <div className="ml-7">
                  {parsedFieldItems.map((p) => (
                    <ParsedFieldsTable key={p.item} item={p} />
                  ))}
                </div>
              )}

              {/* Validation fields (intent requirement checks) */}
              {validationItems.length > 0 && (
                <div className="ml-7">
                  <ValidationTable items={validationItems} />
                </div>
              )}

              {/* API call trace log */}
              {traceItems.length > 0 && (
                <div className="ml-7">
                  <ApiTraceLog items={traceItems} />
                </div>
              )}

              {/* SAP verification/resolution cards */}
              {entityItems.length > 0 && (
                <div className="ml-7">
                  {entityItems.map((p) =>
                    p.entityType === 'purchaseOrder' ? (
                      <POValidationCard key={p.item} item={p} />
                    ) : (
                      <ItemResolutionCard key={p.item} item={p} />
                    ),
                  )}
                </div>
              )}

              {/* Business rules check breakdown */}
              {guardCheckItems.length > 0 && (
                <div className="ml-7">
                  <GuardChecksTable items={guardCheckItems} />
                </div>
              )}

              {/* Business rules / guard rail results */}
              {guardItems.length > 0 && (
                <div className="ml-7">
                  {guardItems.map((p) =>
                    p.entityType === 'guardViolation' ? (
                      <GuardViolationCard key={p.item} item={p} />
                    ) : p.entityType === 'guardSummary' ? (
                      <GuardSummaryCard key={p.item} item={p} />
                    ) : null,
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {error && !STAGES.some((s) => s.key === currentStage) && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
