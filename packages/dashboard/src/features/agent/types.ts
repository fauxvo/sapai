export type PipelineStage =
  | 'parsing'
  | 'validating'
  | 'resolving'
  | 'planning'
  | 'executing';

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  model: string;
}

export interface StageDetail {
  stage: PipelineStage;
  startedDetail?: string;
  completedDetail?: string;
  costEstimate?: CostEstimate;
}

export interface ProgressItem {
  item: string;
  detail: string;
  status: 'running' | 'done' | 'failed';
}
