# SAP AI Agent — Dashboard Product Specification

> **Living Document** — This spec serves as the single source of truth for the AI intent-parsing agent
> that lives in `@sapai/dashboard`. Claude Code agents should read this before making any changes.

---

## 1. Product Overview

### Vision

An intelligent agent that translates natural language (from chat, support tickets, or emails) into structured SAP API operations. The agent parses user intent, extracts entities, validates completeness, presents an execution plan for approval, and then executes against the `@sapai/api` backend.

### Core Mental Model

> The AI is a **form-filler**: it reads natural language and fills out a typed intent schema — like completing a structured form on paper. The LLM's only job is classification and extraction; all business logic and execution lives in deterministic TypeScript code.

### What This Is

- A **constrained intent recognition system** — NOT open-ended NLP
- A finite set of known operations mapped to existing SAP API endpoints
- A pipeline: `Parse → Validate → Resolve → Plan → Approve → Execute`

### What This Is NOT

- A general-purpose chatbot or assistant
- A system that makes autonomous decisions about SAP data
- A replacement for the dashboard UI — it's an alternative interaction model

---

## 2. Architecture

### 2.1 System Context

```
┌─────────────────────────────────────────────────────────────┐
│                    Input Sources                             │
│  ┌──────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │ Chat UI  │  │ Support Tickets  │  │  Email Ingestion  │  │
│  │ (dev/MVP)│  │ (Zendesk, SNOW)  │  │  (Gmail, Outlook) │  │
│  └────┬─────┘  └───────┬──────────┘  └────────┬──────────┘  │
│       │                │                       │             │
│       └────────────────┼───────────────────────┘             │
│                        ▼                                     │
│           ┌────────────────────────┐                         │
│           │   Agent Core Engine    │  ← UI-agnostic          │
│           │   (Intent Pipeline)    │                         │
│           └───────────┬────────────┘                         │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼                           ▼
┌──────────────────┐       ┌──────────────────┐
│  @sapai/api      │       │  Claude API      │
│  (Hono backend)  │       │  (via /api proxy) │
│  SAP CRUD ops    │       │  Intent parsing   │
└──────────────────┘       └──────────────────┘
```

### 2.2 Request Flow

```
User Message
  │
  ▼
┌──────────────────────────────────────┐
│ 1. INTENT CLASSIFICATION             │
│    Claude API (tool_use)             │
│    → Which operation(s)?             │
│    → Extract entities                │
│    → Confidence score per intent     │
│    → Supports multi-intent messages  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ 2. VALIDATION                        │
│    TypeScript (deterministic)        │
│    → Are all required fields present?│
│    → Do field values pass Zod schema?│
│    → Flag missing/invalid fields     │
└──────────────┬───────────────────────┘
               │
         ┌─────┴──────┐
         │            │
    Fields OK    Fields Missing
         │            │
         ▼            ▼
    Continue     ┌─────────────────────┐
                 │ 2a. CLARIFICATION   │
                 │   Ask user for      │
                 │   missing fields    │
                 │   (multi-turn)      │
                 └─────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ 3. ENTITY RESOLUTION                 │
│    Fuzzy match against live SAP data │
│    → "forks" → Material TG11        │
│    → Fetch PO line items via API     │
│    → Match user description to       │
│      actual SAP entities             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ 4. EXECUTION PLAN                    │
│    Present structured summary:       │
│    → Intent(s) identified            │
│    → Resolved entities               │
│    → Exact API call(s) to be made    │
│    → Expected outcome                │
│    → Await user approval             │
└──────────────┬───────────────────────┘
               │
          User Approves
               │
               ▼
┌──────────────────────────────────────┐
│ 5. EXECUTION                         │
│    Call @sapai/api endpoints         │
│    → Return success/failure          │
│    → Surface SAP business errors     │
│    → Log full audit trail            │
└──────────────────────────────────────┘
```

### 2.3 API Call Routing

The Claude API call is **server-side only**. The flow is:

```
Dashboard (React) → @sapai/api backend → Claude API
```

The API key never reaches the client. The `/api` package exposes a new route (e.g., `POST /agent/parse`) that the dashboard calls. The backend handles the Claude API request, returns the structured intent to the frontend, and then the frontend handles the confirmation/execution UX.

### 2.4 Where This Lives in the Monorepo

```
packages/
├── api/                          # Existing — SAP CRUD + new agent routes
│   └── src/
│       ├── db/                   # NEW — database layer
│       │   ├── schema.ts         #   Drizzle table definitions
│       │   ├── index.ts          #   DB connection + client export
│       │   ├── migrate.ts        #   Migration runner
│       │   └── migrations/       #   Generated SQL migration files
│       ├── routes/
│       │   ├── sap/              # Existing SAP CRUD routes
│       │   └── agent/            # NEW — agent-specific routes
│       │       ├── parse.ts      #   POST /agent/parse
│       │       ├── execute.ts    #   POST /agent/execute
│       │       ├── conversations.ts  # GET/POST /agent/conversations
│       │       └── history.ts    #   GET  /agent/history
│       └── services/
│           └── agent/            # NEW — agent pipeline logic
│               ├── IntentParser.ts
│               ├── EntityResolver.ts
│               ├── PlanBuilder.ts
│               ├── Executor.ts
│               ├── AuditLogger.ts
│               ├── ConversationStore.ts
│               └── types.ts
├── dashboard/                    # Existing — Vite + React
│   └── src/
│       ├── features/
│       │   └── agent/            # NEW — agent UI components
│       │       ├── AgentChat.tsx
│       │       ├── ExecutionPlan.tsx
│       │       ├── ClarificationPrompt.tsx
│       │       └── hooks/
│       │           └── useAgent.ts
│       └── routes/
│           └── agent.tsx         # NEW — /agent route
└── shared/                       # Existing — shared types
    └── src/
        └── types/
            └── agent.ts          # NEW — shared agent types
```

---

## 3. Intent Registry

### 3.1 Design Principles

- Every supported intent is **explicitly registered** — no catch-all behavior
- Each intent defines a **typed schema** of required and optional fields
- Each intent maps to **exactly one API endpoint** (or a deterministic sequence)
- Intents have a **configurable confirmation policy** (`always` | `never` | `write_only`)
- Unrecognized intents return a structured "not supported" response — never hallucinate an operation

### 3.2 Phase 1 Intents — Purchase Orders

| Intent ID | Description | API Endpoint | Confirmation |
|---|---|---|---|
| `GET_PURCHASE_ORDER` | Retrieve a PO by ID with items | `GET /sap/purchase-orders/{id}` | `never` |
| `LIST_PURCHASE_ORDERS` | List/filter POs | `GET /sap/purchase-orders` | `never` |
| `CREATE_PURCHASE_ORDER` | Create a new PO with items | `POST /sap/purchase-orders` | `always` |
| `UPDATE_PO_HEADER` | Update header-level fields | `PATCH /sap/purchase-orders/{id}` | `write_only` |
| `UPDATE_PO_ITEM` | Update item-level fields (qty, price, etc.) | `PATCH /sap/purchase-orders/{id}/items/{itemId}` | `write_only` |
| `ADD_PO_ITEM` | Add a new item to an existing PO | `POST /sap/purchase-orders/{id}/items` | `always` |
| `DELETE_PURCHASE_ORDER` | Soft-delete an entire PO | `DELETE /sap/purchase-orders/{id}` | `always` |
| `DELETE_PO_ITEM` | Delete a specific line item | `DELETE /sap/purchase-orders/{id}/items/{itemId}` | `always` |
| `GET_PO_ITEMS` | List items for a specific PO | `GET /sap/purchase-orders/{id}/items` | `never` |
| `GET_PO_ITEM` | Get a specific item on a PO | `GET /sap/purchase-orders/{id}/items/{itemId}` | `never` |

### 3.3 Intent Schema Structure

Each registered intent has the following shape:

```typescript
interface IntentDefinition {
  id: string;                          // e.g., 'UPDATE_PO_ITEM'
  description: string;                 // Human-readable for prompt context
  category: 'read' | 'create' | 'update' | 'delete';
  confirmation: 'always' | 'never' | 'write_only';
  requiredFields: FieldDefinition[];
  optionalFields: FieldDefinition[];
  apiEndpoint: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;                      // e.g., '/sap/purchase-orders/{poNumber}/items/{itemId}'
    pathParams: string[];              // e.g., ['poNumber', 'itemId']
    bodySchema?: string;               // Reference to Zod schema name
  };
  examples: string[];                  // Example user utterances for prompt engineering
}

interface FieldDefinition {
  name: string;                        // e.g., 'poNumber'
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  description: string;                 // e.g., 'SAP Purchase Order number (10-digit)'
  sapField?: string;                   // Mapped SAP field name if different
  resolutionStrategy?: 'exact' | 'fuzzy_lookup';  // How to resolve ambiguous values
}
```

### 3.4 Example Intent: `UPDATE_PO_ITEM`

```typescript
{
  id: 'UPDATE_PO_ITEM',
  description: 'Update fields on a specific line item of a purchase order',
  category: 'update',
  confirmation: 'write_only',
  requiredFields: [
    {
      name: 'poNumber',
      type: 'string',
      description: 'Purchase Order number (10-digit string, e.g., 4500000001)',
    },
    {
      name: 'itemIdentifier',
      type: 'string',
      description: 'Item number (e.g., 00010) or natural language description (e.g., "forks")',
      resolutionStrategy: 'fuzzy_lookup',
    },
  ],
  optionalFields: [
    { name: 'quantity', type: 'number', description: 'New order quantity' },
    { name: 'netPrice', type: 'number', description: 'New net price amount' },
    { name: 'plant', type: 'string', description: 'Plant code' },
    { name: 'description', type: 'string', description: 'Item text/description' },
  ],
  apiEndpoint: {
    method: 'PATCH',
    path: '/sap/purchase-orders/{poNumber}/items/{itemId}',
    pathParams: ['poNumber', 'itemId'],
    bodySchema: 'UpdatePOItemInputSchema',
  },
  examples: [
    'Change the quantity of forks on PO 4500000001 to 44',
    'Update the price on item 00010 of purchase order 4500000001 to 12.50',
    'On PO 4500000001, set the plant for line 00020 to 1710',
  ],
}
```

---

## 4. Claude API Integration

### 4.1 Model & Method

- **Model**: `claude-sonnet-4-5-20250514` (balance of speed and quality for structured extraction)
- **Method**: `tool_use` (forced structured output)
- **Proxy**: All calls go through `@sapai/api` — the API key is server-side only

### 4.2 Tool Definition

The Claude API call uses a single tool that the model is forced to call. The tool's input schema defines the exact structure of a parsed intent:

```typescript
// Tool schema sent to Claude API
{
  name: 'parse_sap_intent',
  description: 'Parse user message into structured SAP operation intent(s)',
  input_schema: {
    type: 'object',
    properties: {
      intents: {
        type: 'array',
        description: 'One or more intents detected in the message',
        items: {
          type: 'object',
          properties: {
            intentId: {
              type: 'string',
              enum: [/* all registered intent IDs */],
            },
            confidence: {
              type: 'number',
              description: 'Confidence 0.0-1.0 that this intent was correctly identified',
            },
            extractedFields: {
              type: 'object',
              description: 'Key-value pairs of extracted entity values',
              additionalProperties: true,
            },
            missingRequiredFields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Required fields that could not be extracted',
            },
            ambiguousFields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  value: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
              description: 'Fields where the extracted value is uncertain',
            },
          },
          required: ['intentId', 'confidence', 'extractedFields'],
        },
      },
      unhandledContent: {
        type: 'string',
        description: 'Parts of the message that do not map to any supported intent',
      },
    },
    required: ['intents'],
  },
}
```

### 4.3 System Prompt Strategy

The system prompt sent to Claude includes:

1. **Role definition**: You are an intent parser for SAP Purchase Order operations
2. **Intent registry**: The full list of supported intents with their fields and examples
3. **Extraction rules**: How to handle PO numbers, item identifiers, quantities, etc.
4. **Constraints**: Only output recognized intents; flag anything outside scope in `unhandledContent`
5. **Confidence guidelines**: When to report low vs. high confidence

The system prompt is **generated dynamically** from the intent registry — not hardcoded prose. This ensures the prompt always reflects the current set of registered intents.

### 4.4 Conversation Context

For multi-turn support, the agent maintains a conversation context object:

```typescript
interface AgentConversationContext {
  conversationId: string;
  messages: AgentMessage[];           // Full message history
  activeEntities: {                   // Entities referenced in recent turns
    purchaseOrder?: string;           // "the PO we were just looking at"
    purchaseOrderItem?: string;
    supplier?: string;
  };
  pendingPlan?: ExecutionPlan;        // Plan awaiting approval
  lastExecutionResult?: ExecutionResult;
}
```

This context is passed with each Claude API call so the model can resolve pronouns and references like "that PO", "change it to 50 instead", "also delete the second item".

---

## 5. Entity Resolution

### 5.1 The Problem

Users say "forks" — SAP stores material code `TG11` on item `00010`. The agent needs to bridge this gap.

### 5.2 Resolution Strategy

When an intent field has `resolutionStrategy: 'fuzzy_lookup'`, the pipeline:

1. Takes the extracted value (e.g., `"forks"`)
2. Fetches the relevant SAP data via the API (e.g., `GET /sap/purchase-orders/{id}/items`)
3. Matches the user's description against item text fields (`purchaseOrderItemText`, `material`)
4. If **single match**: Resolves automatically, includes in plan
5. If **multiple matches**: Presents candidates to user for selection
6. If **no match**: Asks user to clarify or provide the exact item number

### 5.3 Resolution Functions

Resolution is handled by `EntityResolver.ts`, which has methods per entity type:

```typescript
interface ResolvedEntity {
  originalValue: string;       // What the user said: "forks"
  resolvedValue: string;       // SAP item number: "00010"
  resolvedLabel: string;       // Human-readable: "Item 00010 — Forks (Material TG11)"
  confidence: 'exact' | 'high' | 'low' | 'ambiguous';
  candidates?: ResolvedEntity[];  // If ambiguous, all candidates
}
```

---

## 6. Execution Plans

### 6.1 Plan Structure

Before any write operation is executed, the agent builds an execution plan:

```typescript
interface ExecutionPlan {
  planId: string;
  createdAt: string;
  intents: PlannedAction[];
  requiresApproval: boolean;
  summary: string;               // Human-readable summary of all actions
}

interface PlannedAction {
  intentId: string;
  description: string;           // "Update quantity of Forks (item 00010) on PO 4500000001 to 44"
  apiCall: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
  };
  resolvedEntities: ResolvedEntity[];
  risks: string[];               // e.g., "This will change the PO total from $500 to $2,200"
}
```

### 6.2 Confirmation Policy

| Policy | Behavior |
|---|---|
| `always` | Plan is always shown, user must explicitly approve |
| `never` | Executes immediately (read operations only) |
| `write_only` | Plan shown for create/update/delete; reads execute immediately |

The confirmation policy is **configurable per intent** in the intent registry, not hardcoded in the pipeline.

---

## 7. Multi-Intent Support

### 7.1 Compound Messages

The agent can detect and process multiple intents in a single message:

> "Check the status of PO 4500000001 and update the quantity of forks to 44"

This produces two intents:
1. `GET_PURCHASE_ORDER` (poNumber: "4500000001") — `confirmation: never`
2. `UPDATE_PO_ITEM` (poNumber: "4500000001", itemIdentifier: "forks", quantity: 44) — `confirmation: write_only`

### 7.2 Execution Order

- Read operations execute first (they may inform entity resolution for writes)
- Write operations are batched into the execution plan
- If any write depends on a read result, that dependency is explicit in the plan

---

## 8. Audit Logging

### 8.1 What Gets Logged

Every interaction with the agent is logged for auditability:

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: string;
  conversationId: string;
  phase: 'parse' | 'validate' | 'resolve' | 'plan' | 'approve' | 'execute' | 'error';
  input: unknown;               // What went into this phase
  output: unknown;              // What came out
  userId?: string;              // Who triggered it
  durationMs: number;
}
```

### 8.2 Log Phases

Every step in the pipeline logs an entry — including the raw Claude API response, the validation result, entity resolution lookups, the execution plan, the user's approval/rejection, and the final SAP API response (success or error).

### 8.3 Storage

All audit log entries are persisted to the SQLite database (see Section 9). The `audit_log` table is append-only and supports querying via `GET /agent/history`.

---

## 9. Database

### 9.1 Strategy

**SQLite now, Postgres later.** The database uses **Drizzle ORM** for schema definition, migrations, and queries. Drizzle supports both SQLite and Postgres with nearly identical schema definitions, making the migration path straightforward when the system outgrows single-file storage.

- **Current**: SQLite via Bun's built-in `bun:sqlite` driver (`drizzle-orm/bun-sqlite`)
- **Future**: Swap to `drizzle-orm/node-postgres` when needed (multi-user, external services, concurrent ticket ingestion)

### 9.2 Database Location

```
packages/api/
├── src/db/
│   ├── schema.ts          # Drizzle table definitions (single source of truth)
│   ├── index.ts           # DB connection + Drizzle client export
│   ├── migrate.ts         # Migration runner (called on app startup)
│   └── migrations/        # Auto-generated SQL migration files
└── data/
    └── sapai.db           # SQLite file (gitignored)
```

### 9.3 Schema

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// --- Conversations ---

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),                    // UUID
  title: text('title'),                           // Auto-generated or user-set
  sourceType: text('source_type')                 // 'chat' | 'ticket' | 'email'
    .notNull()
    .default('chat'),
  sourceId: text('source_id'),                    // External ticket/email ID
  status: text('status')                          // 'active' | 'archived'
    .notNull()
    .default('active'),
  createdAt: text('created_at').notNull(),         // ISO 8601
  updatedAt: text('updated_at').notNull(),
});

// --- Messages ---

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),                    // UUID
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id),
  role: text('role').notNull(),                   // 'user' | 'agent' | 'system'
  content: text('content').notNull(),             // Raw message text
  metadata: text('metadata'),                     // JSON — parsed intents, plans, etc.
  createdAt: text('created_at').notNull(),
});

// --- Execution Plans ---

export const executionPlans = sqliteTable('execution_plans', {
  id: text('id').primaryKey(),                    // plan_abc123
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id),
  messageId: text('message_id')
    .references(() => messages.id),
  status: text('status').notNull(),               // 'pending' | 'approved' | 'rejected' | 'executed' | 'failed'
  plan: text('plan').notNull(),                   // JSON — full ExecutionPlan object
  result: text('result'),                         // JSON — execution result (after execution)
  approvedAt: text('approved_at'),
  executedAt: text('executed_at'),
  createdAt: text('created_at').notNull(),
});

// --- Audit Log ---

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),                    // UUID
  conversationId: text('conversation_id')
    .references(() => conversations.id),
  planId: text('plan_id')
    .references(() => executionPlans.id),
  phase: text('phase').notNull(),                 // 'parse' | 'validate' | 'resolve' | 'plan' | 'approve' | 'execute' | 'error'
  input: text('input'),                           // JSON
  output: text('output'),                         // JSON
  userId: text('user_id'),
  durationMs: integer('duration_ms'),
  createdAt: text('created_at').notNull(),
});

// --- Active Entities (conversation context) ---

export const conversationEntities = sqliteTable('conversation_entities', {
  id: text('id').primaryKey(),                    // UUID
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id),
  entityType: text('entity_type').notNull(),       // 'purchaseOrder' | 'purchaseOrderItem' | 'supplier'
  entityValue: text('entity_value').notNull(),     // e.g., '4500000001'
  entityLabel: text('entity_label'),               // e.g., 'PO 4500000001 — Forks order'
  updatedAt: text('updated_at').notNull(),
});
```

### 9.4 Why This Schema

- **Conversations** are first-class — not just chat sessions but also ticket/email threads. `sourceType` and `sourceId` prepare for future input sources.
- **Messages** store the full conversation history for multi-turn context. `metadata` (JSON) holds parsed intents, so the conversation can be replayed without re-calling Claude.
- **Execution Plans** are persisted separately so they survive page refreshes, can be audited, and can be approved asynchronously (important for ticket/email workflows where approval may come later).
- **Audit Log** is append-only and links back to conversations and plans for traceability.
- **Conversation Entities** track the "active context" (what PO are we looking at?) so multi-turn resolution works even after the frontend reconnects.

### 9.5 Drizzle Configuration

```typescript
// drizzle.config.ts (in packages/api/)
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/sapai.db',
  },
});
```

### 9.6 Connection Setup

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema.js';

const sqlite = new Database('./data/sapai.db');
sqlite.exec('PRAGMA journal_mode = WAL;');    // Better concurrent read performance
sqlite.exec('PRAGMA foreign_keys = ON;');     // Enforce FK constraints

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
```

### 9.7 Migration to Postgres

When the time comes, the migration involves:

1. Change `drizzle.config.ts` dialect from `sqlite` to `postgresql`
2. Swap `drizzle-orm/bun-sqlite` → `drizzle-orm/node-postgres` in `src/db/index.ts`
3. Update column types in `schema.ts` (e.g., `sqliteTable` → `pgTable`, `text` timestamps → `timestamp`)
4. Generate new Postgres migrations via `drizzle-kit generate`
5. Migrate data from SQLite → Postgres (one-time script)

Drizzle's query builder API stays the same — no application code changes beyond the schema file.

---

## 10. Error Handling

### 10.1 Low-Confidence Parses

If the Claude API returns a confidence score below a configurable threshold (default: `0.6`), the agent **asks the user to clarify** rather than proceeding. The clarification message references what was ambiguous.

### 10.2 SAP Business Errors

When execution fails, the agent surfaces SAP's structured error details (from the `errordetails` array, not just the top-level message) in a user-friendly format. The raw error is logged to the `audit_log` table.

### 10.3 Unsupported Intents

If the user asks for something outside the registered intent set, the response is structured:

```typescript
{
  intents: [],
  unhandledContent: "The user asked to approve a purchase requisition, which is not a supported operation."
}
```

The frontend then shows a helpful message about what operations are supported.

---

## 11. API Routes (New)

These routes are added to `@sapai/api` under a `/agent` prefix:

### `POST /agent/parse`

Sends a user message to Claude API, returns structured intents. Used for the initial parse step.

**Request:**
```json
{
  "message": "On PO 4500000001, change the quantity of forks to 44",
  "conversationContext": { /* optional, for multi-turn */ }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "intents": [
      {
        "intentId": "UPDATE_PO_ITEM",
        "confidence": 0.95,
        "extractedFields": {
          "poNumber": "4500000001",
          "itemIdentifier": "forks",
          "quantity": 44
        },
        "missingRequiredFields": [],
        "ambiguousFields": []
      }
    ],
    "plan": {
      "planId": "plan_abc123",
      "requiresApproval": true,
      "summary": "Update quantity of Forks (item 00010) on PO 4500000001 from 10 → 44",
      "actions": [/* ... */]
    },
    "updatedContext": { /* conversation context for next turn */ }
  }
}
```

### `POST /agent/execute`

Executes an approved plan.

**Request:**
```json
{
  "planId": "plan_abc123",
  "approved": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "intentId": "UPDATE_PO_ITEM",
        "success": true,
        "data": { /* updated PO item */ }
      }
    ]
  }
}
```

### `GET /agent/history`

Retrieve audit log entries. Supports filtering by conversation, date range, phase, etc.

### `GET /agent/conversations`

List conversations with pagination. Returns conversation metadata (not full message history).

**Query params:** `status` (active/archived), `sourceType` (chat/ticket/email), `limit`, `offset`

### `GET /agent/conversations/{id}`

Load a full conversation including messages and active entities. Used to resume a multi-turn session.

### `POST /agent/conversations`

Create a new conversation. Returns the conversation ID for subsequent `/agent/parse` calls.

---

## 12. Frontend Components

### 12.1 Overview

The dashboard chat UI is a **development harness** — a way to test and iterate on the agent pipeline. The core parsing engine is UI-agnostic; the chat is one consumer of it.

### 12.2 Key Components

- **`AgentChat.tsx`** — Main chat container. Renders message history, handles input, manages conversation context via `useAgent` hook.
- **`ExecutionPlan.tsx`** — Renders a plan with approve/reject buttons. Shows each action, resolved entities, and any risks.
- **`ClarificationPrompt.tsx`** — Renders when the agent needs more info. Shows what's missing and provides guided input.
- **`useAgent.ts`** — React hook managing agent state: conversation context, pending plans, loading states. Uses `@tanstack/react-query` for API calls to `/agent/*` routes.

### 12.3 Component Library

No component library is currently installed. The spec does not prescribe one — this is a decision for implementation time. The chat UI should be functional, not polished, for MVP.

---

## 13. Multi-Turn Conversation

### 13.1 Context Memory

The agent remembers entities from recent turns:

> **User**: "Show me PO 4500000001"
> **Agent**: [displays PO with 3 items]
> **User**: "Change the quantity of the first item to 100"
> **Agent**: [resolves "the first item" → item 00010 on PO 4500000001 from context]

### 13.2 Context Window

Conversation context is loaded from the database (`conversations`, `messages`, and `conversation_entities` tables) and sent with each `/agent/parse` call. On the frontend, the `useAgent` hook manages the active conversation ID and fetches context on mount. The database is the source of truth — if the user refreshes the page, context is restored from the DB, not lost.

### 13.3 Context Reset

Context resets when:
- The user explicitly starts a new conversation
- The session times out (configurable)
- The user navigates away from the agent view

---

## 14. Future Input Sources

### 14.1 Support Tickets (Zendesk, ServiceNow)

The agent core engine (`IntentParser`, `EntityResolver`, `PlanBuilder`, `Executor`) is designed to be input-source agnostic. A future ticket ingestion service would:

1. Poll or receive webhooks from the ticketing system
2. Extract the relevant text content
3. Call the same `POST /agent/parse` endpoint
4. Present the plan to an operator for approval (via dashboard or ticketing system)

### 14.2 Email (Gmail, Outlook)

Same pattern — an email ingestion service extracts the message body and passes it through the agent pipeline. Email-specific concerns (threading, CC handling, reply formatting) live in the ingestion layer, not the agent core.

### 14.3 Design Implication

The agent core must **never** assume it's being driven by a chat UI. All input/output flows through the API routes. The chat UI, ticket ingestion, and email ingestion are all equal consumers.

---

## 15. Tech Stack Summary

| Component | Technology |
|---|---|
| Monorepo | Bun workspaces + Turborepo |
| Dashboard framework | Vite + React 19 |
| Routing | TanStack Router |
| Data fetching | TanStack React Query |
| API framework | Hono on Bun |
| API spec | `@hono/zod-openapi` (OpenAPI 3.1) |
| Validation | Zod |
| LLM provider | Claude API (Anthropic) |
| LLM method | `tool_use` (forced structured output) |
| Database | SQLite via `bun:sqlite` (Postgres-ready) |
| ORM | Drizzle ORM (`drizzle-orm` + `drizzle-kit`) |
| SAP integration | SAP Cloud SDK + OData V2 |
| Shared types | `@sapai/shared` workspace package |
| Testing | Vitest |
| Linting | ESLint 9 + Prettier |

---

## 16. Implementation Phases

### Phase 1: Intent Pipeline MVP

- [ ] Define `IntentDefinition` types and the intent registry for all 10 PO intents
- [ ] Implement `IntentParser` — Claude API tool_use call with dynamic system prompt
- [ ] Implement `POST /agent/parse` route in `@sapai/api`
- [ ] Basic validation layer (required field checking against intent schema)
- [ ] Unit tests for intent parsing with mocked Claude responses
- [ ] Environment config for `ANTHROPIC_API_KEY`
- [ ] Set up Drizzle ORM with SQLite schema (`conversations`, `messages`, `audit_log`)
- [ ] Auto-run migrations on app startup
- [ ] Add `data/` to `.gitignore` (SQLite file)

### Phase 2: Entity Resolution + Execution Plans

- [ ] Implement `EntityResolver` with fuzzy matching against PO line items
- [ ] Implement `PlanBuilder` — transform validated intents into execution plans
- [ ] Implement `POST /agent/execute` route
- [ ] Implement `Executor` — execute plans against existing SAP API routes
- [ ] Persist execution plans to `execution_plans` table
- [ ] Configurable confirmation policies per intent
- [ ] Multi-intent detection and ordered execution

### Phase 3: Dashboard Chat UI

- [ ] `AgentChat.tsx` with message history and input
- [ ] `ExecutionPlan.tsx` with approve/reject
- [ ] `ClarificationPrompt.tsx` for missing fields
- [ ] `useAgent.ts` hook with conversation management (create, list, resume)
- [ ] `/agent` route in TanStack Router
- [ ] Multi-turn context memory via `conversation_entities` table
- [ ] Conversation list sidebar (load from DB)

### Phase 4: Audit + Observability

- [ ] `AuditLogger` service writing to `audit_log` table
- [ ] Log every pipeline phase with timing
- [ ] `GET /agent/history` route with filters (conversationId, phase, date range)
- [ ] `GET /agent/conversations` route for listing past conversations
- [ ] Error surfacing (SAP business errors, low confidence, unsupported intents)

### Phase 5: Future Input Sources

- [ ] Ticket ingestion adapter (Zendesk or ServiceNow)
- [ ] Email ingestion adapter (Gmail or Outlook)
- [ ] Operator approval workflow for non-chat sources
- [ ] Evaluate migration to Postgres if concurrent access patterns emerge

---

## 17. Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-02 | Claude API via `tool_use` for structured output | Guarantees consistent JSON schema responses — the AI fills out a "form", never free-text |
| 2026-02 | Server-side Claude API proxy | API key stays in backend; dashboard never touches it |
| 2026-02 | Constrained intent registry (not open-ended NLP) | Enterprise safety — only registered operations can be triggered; no hallucinated actions |
| 2026-02 | Configurable confirmation per intent | Reads don't need approval; deletes always do; updates are configurable |
| 2026-02 | Fuzzy entity resolution via API lookup | Users say "forks", SAP stores material codes; bridge the gap with live data lookups |
| 2026-02 | Multi-intent support from day one | Support tickets often contain compound requests; architecture must handle this |
| 2026-02 | UI-agnostic agent core | Chat UI is a dev harness; tickets and email are the production input sources |
| 2026-02 | Full audit logging at every pipeline phase | Enterprise requirement — every parse, plan, and execution must be traceable |
| 2026-02 | PO CRUD only for Phase 1 | Match the scope of the existing API; expand intents as new SAP services are added |
| 2026-02 | Low confidence → ask user to clarify | Never guess on ambiguous input; surface uncertainty to the user |
| 2026-02 | Dynamic system prompt from intent registry | Prompt always reflects current intents; no drift between code and prompt |
| 2026-02 | SQLite + Drizzle ORM (Postgres-ready) | Zero infrastructure for MVP; Drizzle's driver-agnostic API makes Postgres migration a config change, not a rewrite |
| 2026-02 | Conversations as first-class DB entities | Enables multi-turn context persistence, conversation resumption, and future ticket/email thread tracking |

---

## 18. References

- **API Project Spec**: `packages/api/PROJECT_SPEC.md`
- **CLAUDE.md (root)**: Project-wide conventions and architecture
- **Claude API tool_use docs**: https://docs.anthropic.com/en/docs/build-with-claude/tool-use
- **SAP API Hub — Purchase Orders**: https://api.sap.com/api/API_PURCHASEORDER_PROCESS_SRV/overview
- **Drizzle ORM docs**: https://orm.drizzle.team/docs/overview
- **Bun SQLite**: https://bun.sh/docs/api/sqlite
