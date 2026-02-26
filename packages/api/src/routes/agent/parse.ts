import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { getOrchestrator } from '../../services/agent/orchestrator-instance.js';
import { getAuth } from '../../middleware/auth.js';

const ParseRequestSchema = z
  .object({
    message: z.string().min(1),
    conversationId: z.string().optional(),
  })
  .openapi('AgentParseRequest');

const ParseResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      conversationId: z.string(),
      messageId: z.string(),
      parseResult: z.object({
        intents: z.array(
          z.object({
            intentId: z.string(),
            confidence: z.number(),
            extractedFields: z.record(z.string(), z.unknown()),
            missingRequiredFields: z.array(z.string()).optional(),
            ambiguousFields: z
              .array(
                z.object({
                  field: z.string(),
                  value: z.string(),
                  reason: z.string(),
                }),
              )
              .optional(),
          }),
        ),
        unhandledContent: z.string().optional(),
      }),
      plan: z
        .object({
          planId: z.string(),
          createdAt: z.string(),
          intents: z.array(z.unknown()),
          requiresApproval: z.boolean(),
          summary: z.string(),
        })
        .optional(),
      executionResult: z.unknown().optional(),
      clarification: z
        .object({
          message: z.string(),
          missingFields: z.array(z.string()),
        })
        .optional(),
    }),
  })
  .openapi('AgentParseResponse');

const parseRoute = createRoute({
  tags: ['Agent'],
  method: 'post',
  path: '/parse',
  request: { body: jsonContent(ParseRequestSchema, 'User message to parse') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ParseResponseSchema, 'Parse result'),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ success: z.literal(false), error: z.string() }),
      'Parse error',
    ),
  },
});

export const parseApp = new OpenAPIHono();

parseApp.openapi(parseRoute, async (c) => {
  const { message, conversationId } = c.req.valid('json');
  const auth = getAuth(c);
  const orchestrator = getOrchestrator();

  const result = await orchestrator.processMessage({
    message,
    conversationId,
    userId: auth?.userId,
  });

  if (result.type === 'error') {
    return c.json(
      { success: false as const, error: result.error.message },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return c.json(
    {
      success: true as const,
      data: {
        conversationId: result.conversationId,
        messageId: result.messageId,
        parseResult: result.parseResult,
        plan:
          result.type === 'plan_pending' || result.type === 'executed'
            ? result.plan
            : undefined,
        executionResult: result.type === 'executed' ? result.result : undefined,
        clarification:
          result.type === 'clarification' ? result.clarification : undefined,
      },
    },
    HttpStatusCodes.OK,
  );
});
