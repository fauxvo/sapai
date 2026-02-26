import { useState } from 'react';
import { useIntents } from '../hooks/useAgent';
import type { IntentDefinition, IntentCategory } from '@sapai/shared';

const CATEGORY_STYLES: Record<
  IntentCategory,
  { bg: string; text: string; border: string; label: string }
> = {
  read: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Read',
  },
  create: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Create',
  },
  update: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Update',
  },
  delete: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Delete',
  },
};

const METHOD_STYLES: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800',
  POST: 'bg-green-100 text-green-800',
  PATCH: 'bg-amber-100 text-amber-800',
  DELETE: 'bg-red-100 text-red-800',
};

const CONFIRMATION_LABELS: Record<string, { text: string; style: string }> = {
  always: {
    text: 'Always requires approval',
    style: 'text-red-600',
  },
  write_only: {
    text: 'Requires approval for writes',
    style: 'text-amber-600',
  },
  never: {
    text: 'No approval needed',
    style: 'text-green-600',
  },
};

function CategoryBadge({ category }: { category: IntentCategory }) {
  const style = CATEGORY_STYLES[category];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${METHOD_STYLES[method] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {method}
    </span>
  );
}

function FieldTable({
  fields,
  label,
}: {
  fields: IntentDefinition['requiredFields'];
  label: string;
}) {
  if (fields.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-1.5 font-medium text-gray-600">Field</th>
              <th className="px-3 py-1.5 font-medium text-gray-600">Type</th>
              <th className="px-3 py-1.5 font-medium text-gray-600">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fields.map((f) => (
              <tr key={f.name}>
                <td className="whitespace-nowrap px-3 py-1.5 font-mono text-gray-800">
                  {f.name}
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 text-gray-500">
                  {f.type}
                </td>
                <td className="px-3 py-1.5 text-gray-600">{f.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IntentCard({ intent }: { intent: IntentDefinition }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const confirmation = CONFIRMATION_LABELS[intent.confirmation];

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {intent.name}
            </h3>
            <CategoryBadge category={intent.category} />
            <MethodBadge method={intent.apiEndpoint.method} />
          </div>
          <p className="mt-1 text-sm text-gray-600">{intent.description}</p>
        </div>
        <svg
          className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-3">
          {/* API Endpoint */}
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <span className="font-mono text-xs text-gray-700">
              <MethodBadge method={intent.apiEndpoint.method} />{' '}
              <span className="ml-1">{intent.apiEndpoint.path}</span>
            </span>
          </div>

          {/* Confirmation policy */}
          {confirmation && (
            <p className={`mt-3 text-xs font-medium ${confirmation.style}`}>
              {confirmation.text}
            </p>
          )}

          {/* Fields */}
          <FieldTable fields={intent.requiredFields} label="Required Fields" />
          <FieldTable fields={intent.optionalFields} label="Optional Fields" />

          {/* Examples */}
          {intent.examples.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Example Prompts
              </p>
              <ul className="space-y-1">
                {intent.examples.map((ex, i) => (
                  <li
                    key={i}
                    className="rounded-md bg-gray-50 px-3 py-1.5 text-xs italic text-gray-700"
                  >
                    &ldquo;{ex}&rdquo;
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Intent ID */}
          <p className="mt-3 text-[10px] font-mono text-gray-400">
            ID: {intent.id}
          </p>
        </div>
      )}
    </div>
  );
}

const ALL_CATEGORIES: IntentCategory[] = ['read', 'create', 'update', 'delete'];

export function IntentsCatalog() {
  const { data: intents = [], isLoading, error } = useIntents();
  const [activeCategory, setActiveCategory] = useState<IntentCategory | 'all'>(
    'all',
  );

  const filtered =
    activeCategory === 'all'
      ? intents
      : intents.filter((i) => i.category === activeCategory);

  const counts = {
    all: intents.length,
    ...Object.fromEntries(
      ALL_CATEGORIES.map((cat) => [
        cat,
        intents.filter((i) => i.category === cat).length,
      ]),
    ),
  } as Record<IntentCategory | 'all', number>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Available Actions</h1>
        <p className="mt-1 text-sm text-gray-600">
          These are the intents the AI agent can understand and execute. Use
          natural language in your pipeline runs — the agent will map your
          request to the appropriate action.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">
          Loading intents...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load intents: {error.message}
        </div>
      ) : (
        <>
          {/* Category filter tabs */}
          <div className="mb-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({counts.all})
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const style = CATEGORY_STYLES[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? `${style.bg} ${style.text} ring-1 ring-current`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {style.label} ({counts[cat]})
                </button>
              );
            })}
          </div>

          {/* Intent cards */}
          <div className="space-y-3">
            {filtered.map((intent) => (
              <IntentCard key={intent.id} intent={intent} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              No intents in this category.
            </div>
          )}
        </>
      )}
    </div>
  );
}
