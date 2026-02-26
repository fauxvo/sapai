import type {
  ParseResult,
  ParsedIntent,
  ExecutionPlan,
  ExecutionResult,
  AgentConversationContext,
  AuditPhase,
  PipelineStageName,
  PipelineProgressItem,
  RunMode,
  RunWithStages,
} from '@sapai/shared';
import type { ConversationStore } from './ConversationStore.js';
import type { IntentParser } from './IntentParser.js';
import type { Validator } from './Validator.js';
import { intentMap } from './intents/registry.js';
import type { EntityResolver } from './EntityResolver.js';
import type { PlanBuilder } from './PlanBuilder.js';
import type { PlanStore } from './PlanStore.js';
import type { Executor } from './Executor.js';
import type { AuditLogger } from './AuditLogger.js';
import type { PipelineRunStore } from './PipelineRunStore.js';
import type { Logger } from '../../utils/logger.js';
import { estimateCost, type TokenUsage } from '../../utils/cost-estimator.js';
import { checkSapHealth } from '../../utils/sap-health.js';
import { env } from '../../config/environment.js';
import { runEventBus } from './RunEventBus.js';

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

const STAGE_ORDER: PipelineStageName[] = [
  'parsing',
  'validating',
  'resolving',
  'planning',
  'executing',
];

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
  pipelineRunStore: PipelineRunStore;
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
        await this.deps.conversationStore.getConversationContext(
          conversationId,
        );

      // --- Parse ---
      await notify({
        stage: 'parsing',
        status: 'started',
        data: {
          detail: 'Sending message to AI model for intent classification...',
        },
      });
      const parseResult = await this.parseIntent(
        message,
        context ?? undefined,
        conversationId,
        userId,
      );
      const { costEstimate } = parseResult;
      const intentSummary =
        parseResult.intents.length > 0
          ? parseResult.intents
              .map(
                (i) =>
                  `${i.intentId} (confidence: ${(i.confidence * 100).toFixed(0)}%)`,
              )
              .join(', ')
          : 'No intents identified';
      const costSuffix = costEstimate
        ? ` (${costEstimate.inputTokens.toLocaleString()} in / ${costEstimate.outputTokens.toLocaleString()} out, $${costEstimate.totalCost.toFixed(4)})`
        : '';
      await notify({
        stage: 'parsing',
        status: 'completed',
        data: {
          detail: `Identified ${parseResult.intents.length} intent(s): ${intentSummary}${costSuffix}`,
          costEstimate,
        },
      });

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
      await notify({
        stage: 'validating',
        status: 'started',
        data: {
          detail: `Checking required fields for ${parseResult.intents.length} intent(s)...`,
        },
      });
      const validationResults = this.deps.validator.validateAll(
        parseResult.intents,
      );
      const allMissing = validationResults.flatMap((v) => v.missingFields);
      const validDetail =
        allMissing.length > 0
          ? `Missing fields: ${allMissing.join(', ')}`
          : `All ${validationResults.length} intent(s) passed validation`;
      await notify({
        stage: 'validating',
        status: 'completed',
        data: { detail: validDetail },
      });

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
      await notify({
        stage: 'resolving',
        status: 'started',
        data: { detail: 'Checking SAP connectivity...' },
      });
      const sapHealth = await checkSapHealth(5000);
      if (sapHealth.status === 'error') {
        const errMsg = `SAP system is unreachable: ${sapHealth.message ?? 'connection failed'} (${sapHealth.responseTimeMs}ms)`;
        this.deps.logger.warn(
          'SAP health check failed — skipping entity resolution',
          {
            status: sapHealth.status,
            message: sapHealth.message,
            responseTimeMs: sapHealth.responseTimeMs,
          },
        );
        await notify({ stage: 'resolving', status: 'error', data: errMsg });
        await this.deps.conversationStore.addMessage(
          conversationId,
          'agent',
          `Unable to process your request: the SAP system is currently unavailable. Please try again later.`,
        );
        return {
          type: 'error',
          conversationId,
          error: new OrchestratorError(errMsg, 'resolve', 'RESOLUTION_FAILED', {
            sapHealth,
          }),
        };
      }
      this.deps.logger.info('SAP health check passed', {
        status: sapHealth.status,
        responseTimeMs: sapHealth.responseTimeMs,
      });

      // --- Resolve entities ---
      await notify({
        stage: 'resolving',
        status: 'progress',
        data: {
          item: 'SAP connectivity',
          detail: `Connected (${sapHealth.responseTimeMs}ms)`,
          index: 0,
          total: 1,
          status: 'done',
        },
      });
      const resolved = await this.resolveEntities(parseResult.intents, notify);
      const resolvedCount = resolved.reduce(
        (sum, r) => sum + r.resolvedEntities.length,
        0,
      );
      await notify({
        stage: 'resolving',
        status: 'completed',
        data: {
          detail: `Resolved ${resolvedCount} entity reference(s) across ${resolved.length} intent(s)`,
        },
      });

      // --- Build plan ---
      await notify({
        stage: 'planning',
        status: 'started',
        data: {
          detail: `Building execution plan for ${resolved.length} resolved intent(s)...`,
        },
      });
      const plan = this.deps.planBuilder.build(resolved);
      await this.deps.planStore.save(plan, conversationId, userMsg.id);
      const actionSummary = plan.intents
        .map((a) => `${a.apiCall.method} ${a.apiCall.path}`)
        .join(', ');
      await notify({
        stage: 'planning',
        status: 'completed',
        data: {
          detail: `Plan: ${plan.intents.length} action(s) — ${actionSummary}${plan.requiresApproval ? ' (approval required)' : ' (auto-execute)'}`,
        },
      });

      // Update active entities
      await this.updateEntities(conversationId, resolved, context);

      // --- Execute if read-only ---
      if (!plan.requiresApproval) {
        await notify({
          stage: 'executing',
          status: 'started',
          data: {
            detail: `Auto-executing ${plan.intents.length} read-only action(s)...`,
          },
        });
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
        const successCount = executionResult.results.filter(
          (r) => r.success,
        ).length;
        const failCount = executionResult.results.length - successCount;
        await notify({
          stage: 'executing',
          status: 'completed',
          data: {
            detail: `Execution complete: ${successCount} succeeded, ${failCount} failed`,
          },
        });

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
  ): Promise<
    ParseResult & {
      costEstimate?: {
        inputTokens: number;
        outputTokens: number;
        totalCost: number;
        model: string;
      };
    }
  > {
    const parseStart = Date.now();
    const parseResult = await this.deps.intentParser.parse(message, context);
    const parseDuration = Date.now() - parseStart;

    // Calculate cost if token usage available
    const tokenUsage = (
      parseResult as ParseResult & { tokenUsage?: TokenUsage }
    ).tokenUsage;
    let costData: {
      inputTokens?: number;
      outputTokens?: number;
      estimatedCost?: number;
    } = {};
    let costEstimate:
      | {
          inputTokens: number;
          outputTokens: number;
          totalCost: number;
          model: string;
        }
      | undefined;
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
          const entitySummary =
            result.resolvedEntities.length > 0
              ? result.resolvedEntities
                  .map((e) => `${e.resolvedLabel} (${e.confidence})`)
                  .join(', ')
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

    return results.filter((r): r is NonNullable<typeof r> => r !== null);
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

  // --- Pipeline Run Methods ---

  async startRun(params: {
    message: string;
    name?: string;
    mode?: RunMode;
    conversationId?: string;
    userId?: string;
    onStageUpdate?: (update: StageUpdate) => Promise<void> | void;
  }): Promise<RunWithStages> {
    const { message, userId, onStageUpdate } = params;
    const mode = params.mode ?? 'auto';

    // Create or load conversation
    let conversationId = params.conversationId;
    if (conversationId) {
      const existing =
        await this.deps.conversationStore.getConversation(conversationId);
      if (!existing) {
        throw new OrchestratorError(
          `Conversation ${conversationId} not found`,
          'error',
          'CONVERSATION_ERROR',
        );
      }
    } else {
      const conv = await this.deps.conversationStore.createConversation({
        title: message.slice(0, 100),
        userId,
      });
      conversationId = conv.id;
    }

    // Save user message
    await this.deps.conversationStore.addMessage(
      conversationId,
      'user',
      message,
    );

    // Create the pipeline run (conversationId is set during creation)
    const runWithStages = await this.deps.pipelineRunStore.createRun({
      inputMessage: message,
      name: params.name,
      mode,
      conversationId,
      userId,
    });

    if (mode === 'auto') {
      // Fire and forget — execute all stages in background.
      // Return the initial state immediately; the SSE stream is the
      // source of truth for live updates.
      this.executeStages({
        runId: runWithStages.run.id,
        fromStage: 'parsing',
        conversationId,
        onStageUpdate,
      }).catch((err) => {
        this.deps.logger.error('Background pipeline execution failed', {
          runId: runWithStages.run.id,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      return runWithStages;
    }

    // Step mode: execute first stage synchronously, then return latest state
    await this.executeStages({
      runId: runWithStages.run.id,
      fromStage: 'parsing',
      conversationId,
      onStageUpdate,
    });

    const latest = await this.deps.pipelineRunStore.getRunWithStages(
      runWithStages.run.id,
    );
    return latest ?? runWithStages;
  }

  async continueRun(params: {
    runId: string;
    onStageUpdate?: (update: StageUpdate) => Promise<void> | void;
  }): Promise<RunWithStages> {
    const run = await this.deps.pipelineRunStore.getById(params.runId);
    if (!run) {
      throw new OrchestratorError(
        `Run ${params.runId} not found`,
        'error',
        'EXECUTION_FAILED',
      );
    }

    if (!run.status.startsWith('paused_at_')) {
      throw new OrchestratorError(
        `Run ${params.runId} is ${run.status}, not paused`,
        'error',
        'EXECUTION_FAILED',
      );
    }

    // Extract stage name from paused_at_<stage>
    const stageName = run.status.replace('paused_at_', '') as PipelineStageName;

    await this.deps.pipelineRunStore.updateRun(params.runId, {
      status: 'running',
    });

    await this.executeStages({
      runId: params.runId,
      fromStage: stageName,
      conversationId: run.conversationId ?? undefined,
      onStageUpdate: params.onStageUpdate,
    });

    const latest = await this.deps.pipelineRunStore.getRunWithStages(
      params.runId,
    );
    if (!latest) {
      throw new OrchestratorError(
        `Run ${params.runId} not found after continue`,
        'error',
        'EXECUTION_FAILED',
      );
    }
    return latest;
  }

  async retryRun(params: {
    runId: string;
    onStageUpdate?: (update: StageUpdate) => Promise<void> | void;
  }): Promise<RunWithStages> {
    const runWithStages = await this.deps.pipelineRunStore.getRunWithStages(
      params.runId,
    );
    if (!runWithStages) {
      throw new OrchestratorError(
        `Run ${params.runId} not found`,
        'error',
        'EXECUTION_FAILED',
      );
    }

    if (runWithStages.run.status !== 'failed') {
      throw new OrchestratorError(
        `Run ${params.runId} is ${runWithStages.run.status}, not failed`,
        'error',
        'EXECUTION_FAILED',
      );
    }

    // Find the failed stage, or the first non-completed stage (handles
    // crash recovery where run is failed but stages weren't updated)
    const failedStage =
      runWithStages.stages.find((s) => s.status === 'failed') ??
      runWithStages.stages.find(
        (s) => s.status !== 'completed' && s.status !== 'skipped',
      );
    if (!failedStage) {
      throw new OrchestratorError(
        `No retryable stage found on run ${params.runId}`,
        'error',
        'EXECUTION_FAILED',
      );
    }

    // Reset the stage
    await this.deps.pipelineRunStore.updateStage(failedStage.id, {
      status: 'pending',
      startedAt: null,
      completedAt: null,
      durationMs: null,
      error: null,
      output: null,
      progressItems: [],
    });

    // Set run back to running
    await this.deps.pipelineRunStore.updateRun(params.runId, {
      status: 'running',
      error: null,
      completedAt: null,
      durationMs: null,
    });

    // Re-execute from the failed stage
    await this.executeStages({
      runId: params.runId,
      fromStage: failedStage.stage,
      conversationId: runWithStages.run.conversationId ?? undefined,
      onStageUpdate: params.onStageUpdate,
    });

    const latest = await this.deps.pipelineRunStore.getRunWithStages(
      params.runId,
    );
    if (!latest) {
      throw new OrchestratorError(
        `Run ${params.runId} not found after retry`,
        'error',
        'EXECUTION_FAILED',
      );
    }
    return latest;
  }

  async approveRun(runId: string, approved: boolean): Promise<RunWithStages> {
    const run = await this.deps.pipelineRunStore.getById(runId);
    if (!run) {
      throw new OrchestratorError(
        `Run ${runId} not found`,
        'error',
        'EXECUTION_FAILED',
      );
    }

    if (run.status !== 'awaiting_approval') {
      throw new OrchestratorError(
        `Run ${runId} is ${run.status}, not awaiting_approval`,
        'error',
        'EXECUTION_FAILED',
      );
    }

    await this.deps.auditLogger.log({
      conversationId: run.conversationId ?? undefined,
      phase: 'approve',
      input: { runId, approved },
      output: null,
      durationMs: 0,
    });

    if (approved) {
      await this.deps.pipelineRunStore.updateRun(runId, {
        status: 'running',
      });

      await this.executeStages({
        runId,
        fromStage: 'executing',
        conversationId: run.conversationId ?? undefined,
      });
    } else {
      // Mark run as completed, executing stage as skipped
      const now = new Date().toISOString();
      const executingStage = await this.deps.pipelineRunStore.getStage(
        runId,
        'executing',
      );
      if (executingStage) {
        await this.deps.pipelineRunStore.updateStage(executingStage.id, {
          status: 'skipped',
        });
      }

      await this.deps.pipelineRunStore.updateRun(runId, {
        status: 'completed',
        completedAt: now,
        durationMs: Date.now() - new Date(run.startedAt).getTime(),
      });
    }

    const latest = await this.deps.pipelineRunStore.getRunWithStages(runId);
    if (!latest) {
      throw new OrchestratorError(
        `Run ${runId} not found after approve`,
        'error',
        'EXECUTION_FAILED',
      );
    }
    return latest;
  }

  private async executeStages(params: {
    runId: string;
    fromStage: PipelineStageName;
    conversationId?: string;
    onStageUpdate?: (update: StageUpdate) => Promise<void> | void;
  }): Promise<void> {
    const { runId, fromStage, onStageUpdate } = params;
    const notify = onStageUpdate ?? (() => {});
    const store = this.deps.pipelineRunStore;

    const runWithStages = await store.getRunWithStages(runId);
    if (!runWithStages) {
      this.deps.logger.error('Run not found in executeStages', { runId });
      return;
    }

    const { stages } = runWithStages;
    const run = runWithStages.run;
    const startIdx = STAGE_ORDER.indexOf(fromStage);
    if (startIdx < 0) {
      this.deps.logger.error('Invalid fromStage', {
        runId,
        fromStage,
      });
      return;
    }

    // Hydrate inter-stage data from completed stages when resuming
    let parseResult:
      | (ParseResult & {
          costEstimate?: {
            inputTokens: number;
            outputTokens: number;
            totalCost: number;
            model: string;
          };
        })
      | undefined;
    let validationResults:
      | Array<{ valid: boolean; intent: ParsedIntent; missingFields: string[] }>
      | undefined;
    let resolved: Awaited<ReturnType<typeof this.resolveEntities>> | undefined;
    let plan: ExecutionPlan | undefined;

    if (startIdx > 0) {
      // Hydrate from completed stages
      for (let i = 0; i < startIdx; i++) {
        const stage = stages[i];
        if (stage.status !== 'completed' || !stage.output) continue;

        switch (stage.stage) {
          case 'parsing':
            parseResult = stage.output as typeof parseResult;
            break;
          case 'validating':
            validationResults = stage.output as typeof validationResults;
            break;
          case 'resolving':
            resolved = stage.output as typeof resolved;
            break;
          case 'planning':
            plan = stage.output as typeof plan;
            break;
        }
      }
    }

    const conversationId =
      params.conversationId ?? run.conversationId ?? undefined;

    for (let i = startIdx; i < STAGE_ORDER.length; i++) {
      const stageName = STAGE_ORDER[i];
      const stageRecord = stages[i];
      const stageStart = Date.now();

      // Mark stage running
      await store.updateStage(stageRecord.id, {
        status: 'running',
        startedAt: new Date().toISOString(),
      });
      await store.updateRun(runId, { currentStage: stageName });

      // Emit SSE
      const updatedStage = await store.getStage(runId, stageName);
      if (updatedStage) {
        runEventBus.emitStageUpdate(runId, updatedStage);
      }

      try {
        switch (stageName) {
          case 'parsing': {
            await notify({
              stage: 'parsing',
              status: 'started',
              data: {
                detail:
                  'Sending message to AI model for intent classification...',
              },
            });

            const context = conversationId
              ? await this.deps.conversationStore.getConversationContext(
                  conversationId,
                )
              : undefined;

            parseResult = await this.parseIntent(
              run.inputMessage,
              context ?? undefined,
              conversationId ?? '',
              run.userId ?? undefined,
            );

            const { costEstimate } = parseResult;
            const intentSummary =
              parseResult.intents.length > 0
                ? parseResult.intents
                    .map(
                      (intent) =>
                        `${intent.intentId} (confidence: ${(intent.confidence * 100).toFixed(0)}%)`,
                    )
                    .join(', ')
                : 'No intents identified';

            const progressItems: PipelineProgressItem[] =
              parseResult.intents.map((intent) => ({
                item: intent.intentId,
                detail: `confidence: ${(intent.confidence * 100).toFixed(0)}%`,
                status: 'done' as const,
              }));

            // Emit parsed field items per intent for the ParsedFieldsTable
            for (const intent of parseResult.intents) {
              progressItems.push({
                item: `fields:${intent.intentId}`,
                detail: `${Object.keys(intent.extractedFields).filter((k) => intent.extractedFields[k] !== undefined && intent.extractedFields[k] !== null && intent.extractedFields[k] !== '').length} fields extracted`,
                status: 'done' as const,
                entityType: 'parsedFields',
                metadata: {
                  intentId: intent.intentId,
                  extractedFields: intent.extractedFields,
                  fieldConfidence: intent.fieldConfidence,
                },
              });
            }

            const stageDuration = Date.now() - stageStart;
            await store.updateStage(stageRecord.id, {
              status: 'completed',
              completedAt: new Date().toISOString(),
              durationMs: stageDuration,
              detail: `Identified ${parseResult.intents.length} intent(s): ${intentSummary}`,
              output: parseResult,
              progressItems,
              costEstimate: costEstimate ?? null,
            });

            await notify({
              stage: 'parsing',
              status: 'completed',
              data: {
                detail: `Identified ${parseResult.intents.length} intent(s): ${intentSummary}`,
                costEstimate,
              },
            });

            // No intents => mark remaining as skipped, complete run
            if (parseResult.intents.length === 0) {
              for (let j = i + 1; j < STAGE_ORDER.length; j++) {
                await store.updateStage(stages[j].id, {
                  status: 'skipped',
                });
              }
              const now = new Date().toISOString();
              await store.updateRun(runId, {
                status: 'completed',
                completedAt: now,
                durationMs: Date.now() - new Date(run.startedAt).getTime(),
                result: parseResult,
              });
              const finalStage = await store.getStage(runId, stageName);
              if (finalStage) runEventBus.emitStageUpdate(runId, finalStage);
              runEventBus.emitRunComplete(runId);
              return;
            }
            break;
          }

          case 'validating': {
            if (!parseResult) {
              throw new OrchestratorError(
                'No parse result available for validation',
                'validate',
                'VALIDATION_FAILED',
              );
            }

            await notify({
              stage: 'validating',
              status: 'started',
              data: {
                detail: `Checking required fields for ${parseResult.intents.length} intent(s)...`,
              },
            });

            validationResults = this.deps.validator.validateAll(
              parseResult.intents,
            );
            const allMissing = validationResults.flatMap(
              (v) => v.missingFields,
            );
            const validDetail =
              allMissing.length > 0
                ? `Missing fields: ${allMissing.join(', ')}`
                : `All ${validationResults.length} intent(s) passed validation`;

            // Build field-by-field validation progress items
            const validationProgressItems: PipelineProgressItem[] = [];
            for (const result of validationResults) {
              const definition = intentMap.get(result.intent.intentId);
              if (!definition) continue;

              // Required fields
              for (const field of definition.requiredFields) {
                const value = result.intent.extractedFields[field.name];
                const fc = result.intent.fieldConfidence?.[field.name];
                const isPresent =
                  value !== undefined && value !== null && value !== '';
                validationProgressItems.push({
                  item: `${result.intent.intentId}:${field.name}`,
                  detail: isPresent ? `${String(value)}` : `MISSING`,
                  status: isPresent ? 'done' : 'failed',
                  entityType: 'validationField',
                  metadata: {
                    intentId: result.intent.intentId,
                    fieldName: field.name,
                    fieldDescription: field.description,
                    fieldType: field.type,
                    required: true,
                    value: isPresent ? value : null,
                    fieldConfidence: fc ?? null,
                    resolutionStrategy: field.resolutionStrategy ?? null,
                  },
                });
              }

              // Optional fields that have values
              for (const field of definition.optionalFields) {
                const value = result.intent.extractedFields[field.name];
                if (value === undefined || value === null || value === '')
                  continue;
                const fc = result.intent.fieldConfidence?.[field.name];
                validationProgressItems.push({
                  item: `${result.intent.intentId}:${field.name}`,
                  detail: `${String(value)}`,
                  status: 'done',
                  entityType: 'validationField',
                  metadata: {
                    intentId: result.intent.intentId,
                    fieldName: field.name,
                    fieldDescription: field.description,
                    fieldType: field.type,
                    required: false,
                    value,
                    fieldConfidence: fc ?? null,
                    resolutionStrategy: field.resolutionStrategy ?? null,
                  },
                });
              }
            }

            const stageDuration = Date.now() - stageStart;
            await store.updateStage(stageRecord.id, {
              status: 'completed',
              completedAt: new Date().toISOString(),
              durationMs: stageDuration,
              detail: validDetail,
              output: validationResults,
              progressItems: validationProgressItems,
            });

            await notify({
              stage: 'validating',
              status: 'completed',
              data: { detail: validDetail },
            });

            // If missing fields, mark remaining as skipped
            if (allMissing.length > 0) {
              for (let j = i + 1; j < STAGE_ORDER.length; j++) {
                await store.updateStage(stages[j].id, {
                  status: 'skipped',
                });
              }
              const now = new Date().toISOString();
              await store.updateRun(runId, {
                status: 'completed',
                completedAt: now,
                durationMs: Date.now() - new Date(run.startedAt).getTime(),
                result: {
                  type: 'clarification',
                  missingFields: allMissing,
                },
              });
              const finalStage = await store.getStage(runId, stageName);
              if (finalStage) runEventBus.emitStageUpdate(runId, finalStage);
              runEventBus.emitRunComplete(runId);
              return;
            }

            // Check confidence threshold
            const lowConfidence = parseResult.intents.filter(
              (intent) => intent.confidence < env.AGENT_CONFIDENCE_THRESHOLD,
            );
            if (lowConfidence.length > 0) {
              for (let j = i + 1; j < STAGE_ORDER.length; j++) {
                await store.updateStage(stages[j].id, {
                  status: 'skipped',
                });
              }
              const now = new Date().toISOString();
              await store.updateRun(runId, {
                status: 'completed',
                completedAt: now,
                durationMs: Date.now() - new Date(run.startedAt).getTime(),
                result: {
                  type: 'clarification',
                  lowConfidence: lowConfidence.map((intent) => intent.intentId),
                },
              });
              const finalStage = await store.getStage(runId, stageName);
              if (finalStage) runEventBus.emitStageUpdate(runId, finalStage);
              runEventBus.emitRunComplete(runId);
              return;
            }
            break;
          }

          case 'resolving': {
            if (!parseResult) {
              throw new OrchestratorError(
                'No parse result available for resolution',
                'resolve',
                'RESOLUTION_FAILED',
              );
            }

            await notify({
              stage: 'resolving',
              status: 'started',
              data: { detail: 'Checking SAP connectivity...' },
            });

            // SAP health pre-check
            const sapHealth = await checkSapHealth(5000);
            if (sapHealth.status === 'error') {
              const errMsg = `SAP system is unreachable: ${sapHealth.message ?? 'connection failed'} (${sapHealth.responseTimeMs}ms)`;
              this.deps.logger.warn('SAP health check failed', {
                status: sapHealth.status,
                message: sapHealth.message,
                responseTimeMs: sapHealth.responseTimeMs,
              });
              throw new OrchestratorError(
                errMsg,
                'resolve',
                'RESOLUTION_FAILED',
                { sapHealth },
              );
            }

            await notify({
              stage: 'resolving',
              status: 'progress',
              data: {
                item: 'SAP connectivity',
                detail: `Connected (${sapHealth.responseTimeMs}ms)`,
                status: 'done',
              },
            });

            // Resolve entities
            resolved = await this.resolveEntities(parseResult.intents, notify);

            const progressItems: PipelineProgressItem[] = [];

            // Add entity items with proper entityType and full metadata
            for (const r of resolved) {
              for (const e of r.resolvedEntities) {
                // Map parseConfidence from the intent's fieldConfidence
                const fieldName =
                  e.entityType === 'purchaseOrder'
                    ? 'poNumber'
                    : 'itemIdentifier';
                const fc = r.intent.fieldConfidence?.[fieldName];

                // Build a descriptive detail string
                const isNotFound =
                  e.confidence === 'low' && e.metadata?.exists === false;
                const detail = isNotFound
                  ? e.resolvedLabel // e.g. "PO 4500005678 not found in SAP"
                  : e.resolvedValue
                    ? `${e.originalValue} \u2192 ${e.resolvedValue}`
                    : e.resolvedLabel;

                progressItems.push({
                  item: e.resolvedLabel,
                  detail,
                  status: isNotFound ? ('failed' as const) : ('done' as const),
                  entityType: e.entityType, // 'purchaseOrder' | 'purchaseOrderItem'
                  matchType: e.matchType,
                  confidence: e.confidence,
                  originalValue: e.originalValue,
                  resolvedValue: e.resolvedValue,
                  metadata: e.metadata,
                  parseConfidence: fc,
                  candidates: e.candidates,
                });
              }

              // Add API trace items
              for (const t of r.traces) {
                progressItems.push({
                  item: `${t.method} ${t.path}`,
                  detail: t.detail,
                  status: t.status === 'error' ? 'failed' : 'done',
                  entityType: 'apiTrace',
                  metadata: {
                    method: t.method,
                    path: t.path,
                    callStatus: t.status,
                    durationMs: t.durationMs,
                  },
                });
              }
            }

            const resolvedCount = resolved.reduce(
              (sum, r) => sum + r.resolvedEntities.length,
              0,
            );
            const stageDuration = Date.now() - stageStart;
            await store.updateStage(stageRecord.id, {
              status: 'completed',
              completedAt: new Date().toISOString(),
              durationMs: stageDuration,
              detail: `Resolved ${resolvedCount} entity reference(s) across ${resolved.length} intent(s)`,
              output: resolved,
              progressItems,
            });

            await notify({
              stage: 'resolving',
              status: 'completed',
              data: {
                detail: `Resolved ${resolvedCount} entity reference(s) across ${resolved.length} intent(s)`,
              },
            });

            // Update active entities
            if (conversationId) {
              const context =
                await this.deps.conversationStore.getConversationContext(
                  conversationId,
                );
              await this.updateEntities(
                conversationId,
                resolved,
                context ?? undefined,
              );
            }
            break;
          }

          case 'planning': {
            if (!resolved) {
              throw new OrchestratorError(
                'No resolved entities available for planning',
                'plan',
                'PLAN_FAILED',
              );
            }

            // Gate: block plan creation if any entity resolution failed
            const failures = resolved.flatMap(({ resolvedEntities }) =>
              resolvedEntities.filter(
                (e) =>
                  e.confidence === 'low' &&
                  (e.metadata as Record<string, unknown> | undefined)
                    ?.exists === false,
              ),
            );
            if (failures.length > 0) {
              const failureSummary = failures
                .map((e) => {
                  const meta = e.metadata as
                    | Record<string, unknown>
                    | undefined;
                  const prefix =
                    e.entityType === 'purchaseOrder'
                      ? 'PO'
                      : (e.entityType ?? 'Entity');
                  return meta?.httpStatus === 404
                    ? `${prefix} ${e.originalValue} not found`
                    : `${prefix} ${e.originalValue} could not be verified (lookup failed)`;
                })
                .join('; ');
              throw new OrchestratorError(
                `Cannot build execution plan: ${failureSummary}. All entities must be validated before proceeding.`,
                'plan',
                'PLAN_FAILED',
                { failures: failures.map((e) => e.originalValue) },
              );
            }

            await notify({
              stage: 'planning',
              status: 'started',
              data: {
                detail: `Building execution plan for ${resolved.length} resolved intent(s)...`,
              },
            });

            plan = this.deps.planBuilder.build(resolved);
            if (conversationId) {
              await this.deps.planStore.save(plan, conversationId);
            }

            const actionSummary = plan.intents
              .map((a) => `${a.apiCall.method} ${a.apiCall.path}`)
              .join(', ');

            const stageDuration = Date.now() - stageStart;
            await store.updateStage(stageRecord.id, {
              status: 'completed',
              completedAt: new Date().toISOString(),
              durationMs: stageDuration,
              detail: `Plan: ${plan.intents.length} action(s) — ${actionSummary}${plan.requiresApproval ? ' (approval required)' : ' (auto-execute)'}`,
              output: plan,
            });

            await notify({
              stage: 'planning',
              status: 'completed',
              data: {
                detail: `Plan: ${plan.intents.length} action(s) — ${actionSummary}${plan.requiresApproval ? ' (approval required)' : ' (auto-execute)'}`,
              },
            });

            // If plan requires approval, pause the run
            if (plan.requiresApproval) {
              await store.updateRun(runId, {
                status: 'awaiting_approval',
              });
              if (conversationId) {
                await this.deps.conversationStore.addMessage(
                  conversationId,
                  'agent',
                  `Plan ready for approval: ${plan.summary}`,
                  { plan },
                );
              }
              const finalStage = await store.getStage(runId, stageName);
              if (finalStage) runEventBus.emitStageUpdate(runId, finalStage);
              return;
            }
            break;
          }

          case 'executing': {
            if (!plan) {
              throw new OrchestratorError(
                'No plan available for execution',
                'execute',
                'EXECUTION_FAILED',
              );
            }

            await notify({
              stage: 'executing',
              status: 'started',
              data: {
                detail: `Auto-executing ${plan.intents.length} action(s)...`,
              },
            });

            const executionResult = await this.deps.executor.execute(
              plan,
              conversationId ?? '',
            );

            if (plan.planId) {
              await this.deps.planStore.updateStatus(
                plan.planId,
                executionResult.overallSuccess ? 'executed' : 'failed',
                executionResult,
              );
            }

            const successCount = executionResult.results.filter(
              (r) => r.success,
            ).length;
            const failCount = executionResult.results.length - successCount;

            const stageDuration = Date.now() - stageStart;
            await store.updateStage(stageRecord.id, {
              status: 'completed',
              completedAt: new Date().toISOString(),
              durationMs: stageDuration,
              detail: `Execution complete: ${successCount} succeeded, ${failCount} failed`,
              output: executionResult,
            });

            // Save agent message
            if (conversationId) {
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
            }

            await notify({
              stage: 'executing',
              status: 'completed',
              data: {
                detail: `Execution complete: ${successCount} succeeded, ${failCount} failed`,
              },
            });
            break;
          }
        }

        // Emit updated stage
        const completedStage = await store.getStage(runId, stageName);
        if (completedStage) {
          runEventBus.emitStageUpdate(runId, completedStage);
        }

        // Step mode: pause after this stage if not the last
        if (run.mode === 'step' && i < STAGE_ORDER.length - 1) {
          const nextStage = STAGE_ORDER[i + 1];
          await store.updateRun(runId, {
            status: `paused_at_${nextStage}` as RunWithStages['run']['status'],
          });
          return;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        this.deps.logger.error('Stage failed', {
          runId,
          stage: stageName,
          error: errMsg,
        });

        await store.updateStage(stageRecord.id, {
          status: 'failed',
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - stageStart,
          error: errMsg,
        });

        await store.updateRun(runId, {
          status: 'failed',
          error: errMsg,
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - new Date(run.startedAt).getTime(),
        });

        await notify({
          stage: stageName,
          status: 'error',
          data: errMsg,
        });

        const failedStage = await store.getStage(runId, stageName);
        if (failedStage) runEventBus.emitStageUpdate(runId, failedStage);
        runEventBus.emitRunComplete(runId);
        return;
      }
    }

    // All stages completed successfully
    const now = new Date().toISOString();
    await store.updateRun(runId, {
      status: 'completed',
      completedAt: now,
      durationMs: Date.now() - new Date(run.startedAt).getTime(),
      result: plan ?? parseResult ?? null,
    });
    runEventBus.emitRunComplete(runId);
  }
}
