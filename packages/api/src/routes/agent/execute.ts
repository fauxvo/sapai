import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { getOrchestrator } from '../../services/agent/orchestrator-instance.js';
import { OrchestratorError } from '../../services/agent/AgentOrchestrator.js';

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
  const orchestrator = getOrchestrator();

  try {
    const { result } = await orchestrator.executePlan(planId, approved);
    return c.json(
      { success: true as const, data: { planId, result } },
      HttpStatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof OrchestratorError) {
      const status = err.message.includes('not found')
        ? HttpStatusCodes.NOT_FOUND
        : err.message.includes('not pending')
          ? HttpStatusCodes.BAD_REQUEST
          : HttpStatusCodes.INTERNAL_SERVER_ERROR;
      return c.json({ success: false as const, error: err.message }, status);
    }
    const errorMsg =
      err instanceof Error ? err.message : 'Unknown execution error';
    return c.json(
      { success: false as const, error: errorMsg },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});
