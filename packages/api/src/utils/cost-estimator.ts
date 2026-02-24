export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface CostEstimate extends TokenUsage {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

// Pricing in USD per million tokens — last updated 2025-05-14
// Source: https://docs.anthropic.com/en/docs/about-claude/pricing
const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-5-20250514': { inputPerMillion: 3, outputPerMillion: 15 },
  'claude-opus-4-5-20250514': { inputPerMillion: 15, outputPerMillion: 75 },
  'claude-haiku-3-5-20241022': { inputPerMillion: 0.8, outputPerMillion: 4 },
  'claude-sonnet-4-20250514': { inputPerMillion: 3, outputPerMillion: 15 },
  'claude-opus-4-20250514': { inputPerMillion: 15, outputPerMillion: 75 },
};

const DEFAULT_PRICING: ModelPricing = {
  inputPerMillion: 15,
  outputPerMillion: 75,
};

export function getModelPricing(model: string): ModelPricing {
  return MODEL_PRICING[model] ?? DEFAULT_PRICING;
}

export function estimateCost(usage: TokenUsage): CostEstimate {
  const pricing = getModelPricing(usage.model);
  const inputCost = (usage.inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost =
    (usage.outputTokens / 1_000_000) * pricing.outputPerMillion;

  return {
    ...usage,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}
