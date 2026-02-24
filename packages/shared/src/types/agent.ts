// --- Enums (as union types) ---

export type MessageRole = 'user' | 'agent' | 'system';
export type ConversationStatus = 'active' | 'archived';
export type SourceType = 'chat' | 'ticket' | 'email';
export type IntentCategory = 'read' | 'create' | 'update' | 'delete';
export type ConfirmationPolicy = 'always' | 'never' | 'write_only';
export type ResolutionStrategy = 'exact' | 'fuzzy_lookup';
export type ResolutionConfidence = 'exact' | 'high' | 'low' | 'ambiguous';
export type PlanStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'failed';
export type AuditPhase =
  | 'parse'
  | 'validate'
  | 'resolve'
  | 'plan'
  | 'approve'
  | 'execute'
  | 'error';

// --- Intent Registry ---

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  description: string;
  sapField?: string;
  resolutionStrategy?: ResolutionStrategy;
}

export interface IntentDefinition {
  id: string;
  description: string;
  category: IntentCategory;
  confirmation: ConfirmationPolicy;
  requiredFields: FieldDefinition[];
  optionalFields: FieldDefinition[];
  apiEndpoint: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    pathParams: string[];
    bodySchema?: string;
  };
  examples: string[];
}

// --- Parse Result (Claude API output) ---

export interface AmbiguousField {
  field: string;
  value: string;
  reason: string;
}

export interface ParsedIntent {
  intentId: string;
  confidence: number;
  extractedFields: Record<string, unknown>;
  missingRequiredFields?: string[];
  ambiguousFields?: AmbiguousField[];
}

export interface ParseResult {
  intents: ParsedIntent[];
  unhandledContent?: string;
}

// --- Entity Resolution ---

export interface ResolvedEntity {
  originalValue: string;
  resolvedValue: string;
  resolvedLabel: string;
  confidence: ResolutionConfidence;
  candidates?: ResolvedEntity[];
}

// --- Execution Plans ---

export interface PlannedAction {
  intentId: string;
  description: string;
  apiCall: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
  };
  resolvedEntities: ResolvedEntity[];
  risks: string[];
}

export interface ExecutionPlan {
  planId: string;
  createdAt: string;
  intents: PlannedAction[];
  requiresApproval: boolean;
  summary: string;
}

export interface ExecutionActionResult {
  intentId: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ExecutionResult {
  planId: string;
  executedAt: string;
  results: ExecutionActionResult[];
  overallSuccess: boolean;
}

// --- Conversations ---

export interface AgentMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AgentConversation {
  id: string;
  title: string | null;
  sourceType: SourceType;
  sourceId: string | null;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveEntity {
  entityType: string;
  entityValue: string;
  entityLabel?: string;
}

export interface AgentConversationContext {
  conversationId: string;
  messages: AgentMessage[];
  activeEntities: ActiveEntity[];
  pendingPlan?: ExecutionPlan;
  lastExecutionResult?: ExecutionResult;
}

// --- Audit ---

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  conversationId?: string;
  planId?: string;
  phase: AuditPhase;
  input: unknown;
  output: unknown;
  userId?: string;
  durationMs: number;
}

// --- API Request/Response Shapes ---

export interface AgentParseRequest {
  message: string;
  conversationId?: string;
}

export interface AgentParseResponse {
  conversationId: string;
  messageId: string;
  parseResult: ParseResult;
  plan?: ExecutionPlan;
  clarification?: {
    message: string;
    missingFields: string[];
  };
}

export interface AgentExecuteRequest {
  planId: string;
  approved: boolean;
}

export interface AgentExecuteResponse {
  planId: string;
  result: ExecutionResult;
}
