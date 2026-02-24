import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { PlanStore } from '../../services/agent/PlanStore.js';
import { Executor } from '../../services/agent/Executor.js';
import { ConversationStore } from '../../services/agent/ConversationStore.js';
import { AuditLogger } from '../../services/agent/AuditLogger.js';

const planStore = new PlanStore();
const executor = new Executor();
const conversationStore = new ConversationStore();
const auditLogger = new AuditLogger();

const ExecuteRequestSchema = z
  .object({
    planId: z.string().min(1),
    approved: z.boolean(),
  })
  .openapi('AgentExecuteRequest');

const ExecuteResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      planId: z.string(),
      result: z.object({
        planId: z.string(),
        executedAt: z.string(),
        results: z.array(
          z.object({
            intentId: z.string(),
            success: z.boolean(),
            data: z.unknown().optional(),
            error: z.string().optional(),
          }),
        ),
        overallSuccess: z.boolean(),
      }),
    }),
  })
  .openapi('AgentExecuteResponse');

const executeRoute = createRoute({
  tags: ['Agent'],
  method: 'post',
  path: '/execute',
  request: {
    body: jsonContent(ExecuteRequestSchema, 'Plan approval/rejection'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      ExecuteResponseSchema,
      'Execution result',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ success: z.literal(false), error: z.string() }),
      'Plan not found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ success: z.literal(false), error: z.string() }),
      'Invalid request',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ success: z.literal(false), error: z.string() }),
      'Execution error',
    ),
  },
});

export const executeApp = new OpenAPIHono();

executeApp.openapi(executeRoute, async (c) => {
  const { planId, approved } = c.req.valid('json');

  const stored = await planStore.getById(planId);
  if (!stored) {
    return c.json(
      { success: false as const, error: `Plan ${planId} not found` },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  if (stored.status !== 'pending') {
    return c.json(
      {
        success: false as const,
        error: `Plan ${planId} is ${stored.status}, not pending`,
      },
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  // Log approval decision
  await auditLogger.log({
    conversationId: stored.conversationId,
    planId,
    phase: 'approve',
    input: { approved },
    output: null,
    durationMs: 0,
  });

  if (!approved) {
    await planStore.updateStatus(planId, 'rejected');
    await conversationStore.addMessage(
      stored.conversationId,
      'agent',
      'Plan was rejected.',
    );

    return c.json(
      {
        success: true as const,
        data: {
          planId,
          result: {
            planId,
            executedAt: new Date().toISOString(),
            results: [],
            overallSuccess: false,
          },
        },
      },
      HttpStatusCodes.OK,
    );
  }

  // Approve and execute
  await planStore.updateStatus(planId, 'approved');

  try {
    const result = await executor.execute(stored.plan, stored.conversationId);
    await planStore.updateStatus(
      planId,
      result.overallSuccess ? 'executed' : 'failed',
      result,
    );

    const resultSummary = result.overallSuccess
      ? `Executed successfully: ${stored.plan.summary}`
      : `Execution completed with errors`;

    await conversationStore.addMessage(
      stored.conversationId,
      'agent',
      resultSummary,
      { executionResult: result },
    );

    return c.json(
      { success: true as const, data: { planId, result } },
      HttpStatusCodes.OK,
    );
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : 'Unknown execution error';
    return c.json(
      { success: false as const, error: errorMsg },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});
