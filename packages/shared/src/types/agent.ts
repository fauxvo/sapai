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
  | 'decompose'
  | 'parse'
  | 'validate'
  | 'resolve'
  | 'guard'
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
  fieldConfidence?: Record<string, FieldConfidence>;
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
  corroboration?: CorroborationResult;
}

// --- Post-Resolution Confidence Corroboration ---

export type CorroborationSignalResult =
  | 'match'
  | 'mismatch'
  | 'partial'
  | 'unavailable';

export interface CorroborationSignal {
  /** Signal rule identifier, e.g. "quantity_match" */
  id: string;
  /** Human-readable label, e.g. "Quantity" */
  label: string;
  /** What the user said, e.g. "49 units" */
  userClaim: string;
  /** What SAP returned, e.g. "49 EA" */
  sapValue: string;
  /** Whether it matched */
  result: CorroborationSignalResult;
  /** How much this signal weighs in the confidence calculation (0-1) */
  weight: number;
  /** Human explanation, e.g. "User mentioned '49 units', SAP item qty is 49" */
  explanation: string;
}

export interface CorroborationResult {
  /** Resolution confidence before corroboration (0-1) */
  initialConfidence: number;
  /** Resolution confidence after corroboration (0-1) */
  finalConfidence: number;
  /** Individual signals evaluated */
  signals: CorroborationSignal[];
  /** How many signals matched out of total available */
  matchCount: number;
  /** Total signals evaluated (excluding 'unavailable') */
  signalCount: number;
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
  /**
   * When set to true, indicates that some API calls succeeded before the
   * failure occurred (e.g., item fields written but schedule line update
   * failed). Callers MUST NOT blindly retry — inspect `data` and `error`
   * to determine which operations already completed.
   */
  partialSuccess?: boolean;
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
  | 'paused_at_decomposing'
  | 'paused_at_parsing'
  | 'paused_at_validating'
  | 'paused_at_resolving'
  | 'paused_at_guarding'
  | 'paused_at_planning'
  | 'paused_at_executing';

export type PipelineStageStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export type PipelineStageName =
  | 'decomposing'
  | 'parsing'
  | 'validating'
  | 'resolving'
  | 'guarding'
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
  /** For update intents: the current/original value the user mentioned
   *  (e.g. user says "from 49 to 75" → originalValue is "49") */
  originalValue?: string;
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
  corroboration?: CorroborationResult;
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

// --- Business Rules / Guard Rails Types ---

export type GuardSeverity = 'block' | 'warn' | 'info';

export interface GuardViolation {
  /** Unique rule identifier, e.g. "NEGATIVE_QUANTITY" */
  ruleId: string;
  /** Human-readable rule name */
  ruleName: string;
  /** block = stops pipeline, warn = flags for review, info = informational */
  severity: GuardSeverity;
  /** Which intent triggered this violation */
  intentId: string;
  /** Which field is involved (if applicable) */
  field?: string;
  /** Human-readable explanation of the violation */
  message: string;
  /** The current value that triggered the violation */
  currentValue?: unknown;
  /** What SAP has for context (e.g. current quantity on the item) */
  sapValue?: unknown;
  /** Suggested remediation */
  suggestedFix?: string;
}

export interface RuleCheckResult {
  /** Rule identifier */
  ruleId: string;
  /** Human-readable rule name */
  ruleName: string;
  /** Brief description of what the rule checks */
  description: string;
  /** Which intent this was evaluated against */
  intentId: string;
  /** Whether the rule passed */
  passed: boolean;
  /** Severity if it didn't pass */
  severity?: GuardSeverity;
}

export interface BusinessRulesResult {
  /** false if any 'block'-severity violations exist */
  passed: boolean;
  /** All violations found */
  violations: GuardViolation[];
  /** Individual rule check results (pass and fail) for transparency */
  checks: RuleCheckResult[];
  /** Summary of checks performed */
  checksPerformed: number;
  /** Summary of rules that passed */
  rulesPassed: number;
}

// --- Message Decomposition Types ---

export type QuantityChangeType =
  | 'absolute'
  | 'relative_increase'
  | 'relative_decrease'
  | 'percentage'
  | 'multiply';

export interface DecomposedFieldChange {
  /** Which field is being changed */
  field: string;
  /** The current/from value the user mentioned (if any) */
  originalValue?: string;
  /** The target/to value */
  newValue: string;
  /** How the change was expressed */
  changeType: QuantityChangeType;
  /** Exact user text for this change */
  rawExpression: string;
  /** Unit mentioned (e.g., "ft", "EA") */
  unit?: string;
  /** Confidence 0-1 */
  confidence: number;
}

export interface DecomposedSpecification {
  /** What entity is being referenced (e.g., "line 6", "the brakes") */
  targetEntity: string;
  /** Changes to apply */
  fieldChanges: DecomposedFieldChange[];
  /** Material/description keyword hint */
  materialHint?: string;
}

export interface QuantityContext {
  /** The semantic role of this number in the message */
  role: 'original' | 'delivered' | 'target' | 'remaining' | 'adjustment';
  /** The numeric value */
  value: number;
  /** The surrounding text that gives this number meaning */
  context: string;
}

export interface DecompositionResult {
  /** Whether decomposition found complex specs worth structuring */
  needsDecomposition: boolean;
  /** Structured specifications extracted */
  specifications: DecomposedSpecification[];
  /** All quantities found with their semantic roles */
  quantities: QuantityContext[];
  /** Arithmetic consistency check */
  mathCheck?: string;
  /** Anything unusual worth surfacing (partial deliveries, large changes, etc.) */
  warnings: string[];
  /** Clean, unambiguous restatement of the user's request */
  normalizedMessage: string;
  /** Human-readable summary of what was decomposed */
  summary?: string;
}
