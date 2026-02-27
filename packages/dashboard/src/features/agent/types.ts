// Re-export pipeline types from shared
export type {
  PipelineRunStatus,
  PipelineStageStatus,
  PipelineStageName,
  RunMode,
  PipelineRunCostEstimate,
  PipelineProgressItem,
  PipelineRun,
  PipelineStageRecord,
  RunWithStages,
  CreateRunRequest,
} from '@sapai/shared';

// Dashboard-only aliases for backward compatibility
export type PipelineStage = import('@sapai/shared').PipelineStageName;

// Dashboard-local types used by PipelineProgress component
// These have richer fields than the shared PipelineProgressItem

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  model: string;
}

export interface StageDetail {
  stage: import('@sapai/shared').PipelineStageName;
  startedDetail?: string;
  completedDetail?: string;
  costEstimate?: CostEstimate;
}

export type { FieldConfidence as ParseFieldConfidence } from '@sapai/shared';

export interface ProgressItem {
  item: string;
  detail: string;
  status: 'running' | 'done' | 'failed';
  entityType?: string;
  matchType?: string;
  confidence?: import('@sapai/shared').ResolutionConfidence;
  originalValue?: string;
  resolvedValue?: string;
  metadata?: Record<string, unknown>;
  parseConfidence?: import('@sapai/shared').FieldConfidence;
  candidates?: Array<{
    resolvedValue: string;
    resolvedLabel: string;
    confidence: string;
    matchType?: string;
    metadata?: Record<string, unknown>;
  }>;
  corroboration?: import('@sapai/shared').CorroborationResult;
}
