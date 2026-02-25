import type {
  ParseResult,
  ParsedIntent,
  ExecutionPlan,
  ExecutionResult,
  AgentConversationContext,
  AuditPhase,
} from '@sapai/shared';
import type { ConversationStore } from './ConversationStore.js';
import type { IntentParser } from './IntentParser.js';
import type { Validator } from './Validator.js';
import type { EntityResolver } from './EntityResolver.js';
import type { PlanBuilder } from './PlanBuilder.js';
import type { PlanStore } from './PlanStore.js';
import type { Executor } from './Executor.js';
import type { AuditLogger } from './AuditLogger.js';
import type { Logger } from '../../utils/logger.js';
import { estimateCost, type TokenUsage } from '../../utils/cost-estimator.js';
import { checkSapHealth } from '../../utils/sap-health.js';
import { env } from '../../config/environment.js';

// --- Typed errors ---

export class OrchestratorError extends Error {
  constructor(
    message: string,
    public readonly phase: AuditPhase,
    public readonly code: OrchestratorErrorCode,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'OrchestratorError';
  }
}

export type OrchestratorErrorCode =
  | 'PARSE_FAILED'
  | 'VALIDATION_FAILED'
  | 'RESOLUTION_FAILED'
  | 'PLAN_FAILED'
  | 'EXECUTION_FAILED'
  | 'CONVERSATION_ERROR';

// --- Result types ---

export type OrchestratorResult =
  | {
      type: 'clarification';
      conversationId: string;
      messageId: string;
      clarification: { message: string; missingFields: string[] };
      parseResult: ParseResult;
    }
  | {
      type: 'plan_pending';
      conversationId: string;
      messageId: string;
      plan: ExecutionPlan;
      parseResult: ParseResult;
    }
  | {
      type: 'executed';
      conversationId: string;
      messageId: string;
      plan: ExecutionPlan;
      result: ExecutionResult;
      parseResult: ParseResult;
    }
  | {
      type: 'error';
      conversationId?: string;
      error: OrchestratorError;
    };

// --- Stage update callback for SSE ---

export type StageUpdate = {
  stage: 'parsing' | 'validating' | 'resolving' | 'planning' | 'executing';
  status: 'started' | 'completed' | 'error' | 'progress';
  data?: unknown;
};

// --- Orchestrator ---

interface OrchestratorDeps {
  conversationStore: ConversationStore;
  intentParser: IntentParser;
  validator: Validator;
  entityResolver: EntityResolver;
  planBuilder: PlanBuilder;
  planStore: PlanStore;
  executor: Executor;
  auditLogger: AuditLogger;
  logger: Logger;
}

export class AgentOrchestrator {
  private deps: OrchestratorDeps;

  constructor(deps: OrchestratorDeps) {
    this.deps = deps;
  }

  async processMessage(params: {
    message: string;
    conversationId?: string;
    userId?: string;
    onStageUpdate?: (update: StageUpdate) => Promise<void> | void;
  }): Promise<OrchestratorResult> {
    const { message, userId, onStageUpdate } = params;
    const notify = onStageUpdate ?? (() => {});

    try {
      // Create or load conversation
      let conversationId = params.conversationId;
      if (conversationId) {
        const existing =
          await this.deps.conversationStore.getConversation(conversationId);
        if (!existing) {
          return {
            type: 'error',
            error: new OrchestratorError(
              `Conversation ${conversationId} not found`,
              'error',
              'CONVERSATION_ERROR',
            ),
          };
        }
      } else {
        const conv = await this.deps.conversationStore.createConversation({
          title: message.slice(0, 100),
          userId,
        });
        conversationId = conv.id;
      }

      // Save user message
      const userMsg = await this.deps.conversationStore.addMessage(
        conversationId,
        'user',
        message,
      );

      // Load context
      const context =
        await this.deps.conversationStore.getConversationContext(conversationId);

      // --- Parse ---
      await notify({ stage: 'parsing', status: 'started', data: { detail: 'Sending message to AI model for intent classification...' } });
      const parseResult = await this.parseIntent(
        message,
        context ?? undefined,
        conversationId,
        userId,
      );
      const { costEstimate } = parseResult;
      const intentSummary = parseResult.intents.length > 0
        ? parseResult.intents.map(i => `${i.intentId} (confidence: ${(i.confidence * 100).toFixed(0)}%)`).join(', ')
        : 'No intents identified';
      const costSuffix = costEstimate
        ? ` (${costEstimate.inputTokens.toLocaleString()} in / ${costEstimate.outputTokens.toLocaleString()} out, $${costEstimate.totalCost.toFixed(4)})`
        : '';
      await notify({ stage: 'parsing', status: 'completed', data: { detail: `Identified ${parseResult.intents.length} intent(s): ${intentSummary}${costSuffix}`, costEstimate } });

      // No intents
      if (parseResult.intents.length === 0) {
        const agentMsg =
          parseResult.unhandledContent ??
          "I couldn't identify a supported operation in your message.";
        await this.deps.conversationStore.addMessage(
          conversationId,
          'agent',
          agentMsg,
        );
        return {
          type: 'clarification',
          conversationId,
          messageId: userMsg.id,
          clarification: { message: agentMsg, missingFields: [] },
          parseResult,
        };
      }

      // --- Validate ---
      await notify({ stage: 'validating', status: 'started', data: { detail: `Checking required fields for ${parseResult.intents.length} intent(s)...` } });
      const validationResults = this.deps.validator.validateAll(
        parseResult.intents,
      );
      const allMissing = validationResults.flatMap((v) => v.missingFields);
      const validDetail = allMissing.length > 0
        ? `Missing fields: ${allMissing.join(', ')}`
        : `All ${validationResults.length} intent(s) passed validation`;
      await notify({ stage: 'validating', status: 'completed', data: { detail: validDetail } });

      if (allMissing.length > 0) {
        const clarificationMsg = `I need more information: ${allMissing.join(', ')}`;
        await this.deps.conversationStore.addMessage(
          conversationId,
          'agent',
          clarificationMsg,
        );
        return {
          type: 'clarification',
          conversationId,
          messageId: userMsg.id,
          clarification: {
            message: clarificationMsg,
            missingFields: allMissing,
          },
          parseResult,
        };
      }

      // Check confidence threshold
      const lowConfidence = parseResult.intents.filter(
        (i) => i.confidence < env.AGENT_CONFIDENCE_THRESHOLD,
      );
      if (lowConfidence.length > 0) {
        const clarificationMsg = `I'm not confident about: ${lowConfidence.map((i) => i.intentId).join(', ')}. Could you rephrase?`;
        await this.deps.conversationStore.addMessage(
          conversationId,
          'agent',
          clarificationMsg,
        );
        return {
          type: 'clarification',
          conversationId,
          messageId: userMsg.id,
          clarification: { message: clarificationMsg, missingFields: [] },
          parseResult,
        };
      }

      // --- SAP health pre-check ---
      await notify({ stage: 'resolving', status: 'started', data: { detail: 'Checking SAP connectivity...' } });
      const sapHealth = await checkSapHealth(5000);
      if (sapHealth.status === 'error') {
        const errMsg = `SAP system is unreachable: ${sapHealth.message ?? 'connection failed'} (${sapHealth.responseTimeMs}ms)`;
        this.deps.logger.warn('SAP health check failed — skipping entity resolution', {
          status: sapHealth.status,
          message: sapHealth.message,
          responseTimeMs: sapHealth.responseTimeMs,
        });
        await notify({ stage: 'resolving', status: 'error', data: errMsg });
        await this.deps.conversationStore.addMessage(
          conversationId,
          'agent',
          `Unable to process your request: the SAP system is currently unavailable. Please try again later.`,
        );
        return {
          type: 'error',
          conversationId,
          error: new OrchestratorError(
            errMsg,
            'resolve',
            'RESOLUTION_FAILED',
            { sapHealth },
          ),
        };
      }
      this.deps.logger.info('SAP health check passed', {
        status: sapHealth.status,
        responseTimeMs: sapHealth.responseTimeMs,
      });

      // --- Resolve entities ---
      await notify({ stage: 'resolving', status: 'progress', data: { item: 'SAP connectivity', detail: `Connected (${sapHealth.responseTimeMs}ms)`, index: 0, total: 1, status: 'done' } });
      const resolved = await this.resolveEntities(parseResult.intents, notify);
      const resolvedCount = resolved.reduce((sum, r) => sum + r.resolvedEntities.length, 0);
      await notify({ stage: 'resolving', status: 'completed', data: { detail: `Resolved ${resolvedCount} entity reference(s) across ${resolved.length} intent(s)` } });

      // --- Build plan ---
      await notify({ stage: 'planning', status: 'started', data: { detail: `Building execution plan for ${resolved.length} resolved intent(s)...` } });
      const plan = this.deps.planBuilder.build(resolved);
      await this.deps.planStore.save(plan, conversationId, userMsg.id);
      const actionSummary = plan.intents.map(a => `${a.apiCall.method} ${a.apiCall.path}`).join(', ');
      await notify({ stage: 'planning', status: 'completed', data: { detail: `Plan: ${plan.intents.length} action(s) — ${actionSummary}${plan.requiresApproval ? ' (approval required)' : ' (auto-execute)'}` } });

      // Update active entities
      await this.updateEntities(conversationId, resolved, context);

      // --- Execute if read-only ---
      if (!plan.requiresApproval) {
        await notify({ stage: 'executing', status: 'started', data: { detail: `Auto-executing ${plan.intents.length} read-only action(s)...` } });
        const executionResult = await this.deps.executor.execute(
          plan,
          conversationId,
        );
        await this.deps.planStore.updateStatus(
          plan.planId,
          executionResult.overallSuccess ? 'executed' : 'failed',
          executionResult,
        );

        const resultSummary = executionResult.overallSuccess
          ? `Done: ${plan.summary}`
          : `Some operations failed: ${executionResult.results
              .filter((r) => !r.success)
              .map((r) => r.error)
              .join(', ')}`;

        await this.deps.conversationStore.addMessage(
          conversationId,
          'agent',
          resultSummary,
          { plan, executionResult },
        );
        const successCount = executionResult.results.filter(r => r.success).length;
        const failCount = executionResult.results.length - successCount;
        await notify({ stage: 'executing', status: 'completed', data: { detail: `Execution complete: ${successCount} succeeded, ${failCount} failed` } });

        return {
          type: 'executed',
          conversationId,
          messageId: userMsg.id,
          plan,
          result: executionResult,
          parseResult,
        };
      }

      // Plan requires approval
      await this.deps.conversationStore.addMessage(
        conversationId,
        'agent',
        `Plan ready for approval: ${plan.summary}`,
        { plan },
      );

      return {
        type: 'plan_pending',
        conversationId,
        messageId: userMsg.id,
        plan,
        parseResult,
      };
    } catch (err) {
      const error =
        err instanceof OrchestratorError
          ? err
          : new OrchestratorError(
              err instanceof Error ? err.message : 'Unknown error',
              'error',
              'PARSE_FAILED',
            );
      this.deps.logger.error('Pipeline failed', {
        error: error.message,
        phase: error.phase,
      });
      await notify({ stage: 'parsing', status: 'error', data: error.message });
      return {
        type: 'error',
        conversationId: params.conversationId,
        error,
      };
    }
  }

  async parseIntent(
    message: string,
    context: AgentConversationContext | undefined,
    conversationId: string,
    userId?: string,
  ): Promise<ParseResult & { costEstimate?: { inputTokens: number; outputTokens: number; totalCost: number; model: string } }> {
    const parseStart = Date.now();
    const parseResult = await this.deps.intentParser.parse(
      message,
      context,
    );
    const parseDuration = Date.now() - parseStart;

    // Calculate cost if token usage available
    const tokenUsage = (parseResult as ParseResult & { tokenUsage?: TokenUsage }).tokenUsage;
    let costData: { inputTokens?: number; outputTokens?: number; estimatedCost?: number } = {};
    let costEstimate: { inputTokens: number; outputTokens: number; totalCost: number; model: string } | undefined;
    if (tokenUsage) {
      const cost = estimateCost(tokenUsage);
      costData = {
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        estimatedCost: cost.totalCost,
      };
      costEstimate = {
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        totalCost: cost.totalCost,
        model: tokenUsage.model,
      };
    }

    await this.deps.auditLogger.log({
      conversationId,
      phase: 'parse',
      input: { message },
      output: parseResult,
      userId,
      durationMs: parseDuration,
      ...costData,
    });

    return { ...parseResult, costEstimate };
  }

  async resolveEntities(
    intents: ParsedIntent[],
    notify: (update: StageUpdate) => Promise<void> | void = () => {},
  ) {
    const results = await Promise.all(
      intents.map(async (intent, i) => {
        const fields = Object.entries(intent.extractedFields)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');
        await notify({
          stage: 'resolving',
          status: 'progress',
          data: {
            item: `[${i + 1}/${intents.length}] ${intent.intentId}`,
            detail: `Resolving: ${fields || 'no fields'}`,
            index: i,
            total: intents.length,
            status: 'running',
          },
        });

        try {
          const result = await this.deps.entityResolver.resolve(intent);
          const entitySummary = result.resolvedEntities.length > 0
            ? result.resolvedEntities.map(e => `${e.resolvedLabel} (${e.confidence})`).join(', ')
            : 'no entities to resolve';
          await notify({
            stage: 'resolving',
            status: 'progress',
            data: {
              item: `[${i + 1}/${intents.length}] ${intent.intentId}`,
              detail: entitySummary,
              index: i,
              total: intents.length,
              status: 'done',
            },
          });
          return result;
        } catch (err) {
          await notify({
            stage: 'resolving',
            status: 'progress',
            data: {
              item: `[${i + 1}/${intents.length}] ${intent.intentId}`,
              detail: `Failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
              index: i,
              total: intents.length,
              status: 'failed',
            },
          });
          return null;
        }
      }),
    );

    return results.filter(
      (r): r is NonNullable<typeof r> => r !== null,
    );
  }

  async executePlan(
    planId: string,
    approved: boolean,
  ): Promise<{
    planId: string;
    result: ExecutionResult;
  }> {
    const stored = await this.deps.planStore.getById(planId);
    if (!stored) {
      throw new OrchestratorError(
        `Plan ${planId} not found`,
        'error',
        'EXECUTION_FAILED',
      );
    }

    if (stored.status !== 'pending') {
      throw new OrchestratorError(
        `Plan ${planId} is ${stored.status}, not pending`,
        'error',
        'EXECUTION_FAILED',
      );
    }

    await this.deps.auditLogger.log({
      conversationId: stored.conversationId,
      planId,
      phase: 'approve',
      input: { approved },
      output: null,
      durationMs: 0,
    });

    if (!approved) {
      await this.deps.planStore.updateStatus(planId, 'rejected');
      await this.deps.conversationStore.addMessage(
        stored.conversationId,
        'agent',
        'Plan was rejected.',
      );
      return {
        planId,
        result: {
          planId,
          executedAt: new Date().toISOString(),
          results: [],
          overallSuccess: false,
        },
      };
    }

    await this.deps.planStore.updateStatus(planId, 'approved');

    const result = await this.deps.executor.execute(
      stored.plan,
      stored.conversationId,
    );
    await this.deps.planStore.updateStatus(
      planId,
      result.overallSuccess ? 'executed' : 'failed',
      result,
    );

    const resultSummary = result.overallSuccess
      ? `Executed successfully: ${stored.plan.summary}`
      : 'Execution completed with errors';

    await this.deps.conversationStore.addMessage(
      stored.conversationId,
      'agent',
      resultSummary,
      { executionResult: result },
    );

    return { planId, result };
  }

  private async updateEntities(
    conversationId: string,
    resolved: Array<{
      intent: ParsedIntent;
      resolvedEntities: Array<{
        confidence: string;
        resolvedValue: string;
        resolvedLabel: string;
      }>;
    }>,
    context: AgentConversationContext | undefined,
  ) {
    const newEntities = resolved.flatMap((r) =>
      r.resolvedEntities
        .filter((e) => e.confidence === 'exact' || e.confidence === 'high')
        .map((e) => ({
          entityType: 'purchaseOrderItem',
          entityValue: e.resolvedValue,
          entityLabel: e.resolvedLabel,
        })),
    );

    for (const r of resolved) {
      const poNumber = r.intent.extractedFields.poNumber;
      if (poNumber) {
        newEntities.push({
          entityType: 'purchaseOrder',
          entityValue: String(poNumber),
          entityLabel: `PO ${poNumber}`,
        });
      }
    }

    if (newEntities.length > 0) {
      const existing = context?.activeEntities ?? [];
      const merged = [...existing, ...newEntities];
      const seen = new Set<string>();
      const deduped = merged.filter((e) => {
        const key = `${e.entityType}:${e.entityValue}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      await this.deps.conversationStore.updateActiveEntities(
        conversationId,
        deduped,
      );
    }
  }
}
