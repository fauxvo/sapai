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
  name: string;
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
  matchType?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
  candidates?: ResolvedEntity[];
}

// --- PO Summary types ---

export interface POItemSummary {
  itemNumber: string;
  description: string;
  material: string;
  quantity: number;
  unit: string;
  netPrice: number;
  currency: string;
  plant: string;
}

export interface POHeaderSummary {
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
  items: POItemSummary[];
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

// --- Pipeline Run Types ---

export type PipelineRunStatus =
  | 'running'
  | 'completed'
  | 'failed'
  | 'awaiting_approval'
  | 'paused_at_parsing'
  | 'paused_at_validating'
  | 'paused_at_resolving'
  | 'paused_at_planning'
  | 'paused_at_executing';

export type PipelineStageStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export type PipelineStageName =
  | 'parsing'
  | 'validating'
  | 'resolving'
  | 'planning'
  | 'executing';

export type RunMode = 'auto' | 'step';

export interface PipelineRunCostEstimate {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  model: string;
}

export interface FieldConfidence {
  confidence: number;
  rawValue: string;
  interpretation: string;
  alternatives?: string[];
}

export interface PipelineProgressItem {
  item: string;
  detail: string;
  status: 'running' | 'done' | 'failed';
  entityType?: string;
  matchType?: string;
  confidence?: ResolutionConfidence;
  originalValue?: string;
  resolvedValue?: string;
  metadata?: Record<string, unknown>;
  parseConfidence?: FieldConfidence;
  candidates?: ResolvedEntity[];
}

export interface PipelineRun {
  id: string;
  name: string | null;
  conversationId: string | null;
  inputMessage: string;
  status: PipelineRunStatus;
  mode: RunMode;
  currentStage: PipelineStageName | null;
  result: unknown | null;
  error: string | null;
  userId: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  durationMs: number | null;
}

export interface PipelineStageRecord {
  id: string;
  runId: string;
  stage: PipelineStageName;
  status: PipelineStageStatus;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  detail: string | null;
  input: unknown | null;
  output: unknown | null;
  progressItems: PipelineProgressItem[];
  error: string | null;
  costEstimate: PipelineRunCostEstimate | null;
  order: number;
}

export interface RunWithStages {
  run: PipelineRun;
  stages: PipelineStageRecord[];
}

export interface CreateRunRequest {
  message: string;
  name?: string;
  mode?: RunMode;
  conversationId?: string;
}
