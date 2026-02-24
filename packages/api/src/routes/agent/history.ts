import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { AuditLogger } from '../../services/agent/AuditLogger.js';

const auditLogger = new AuditLogger();

const historyRoute = createRoute({
  tags: ['Agent'],
  method: 'get',
  path: '/history',
  request: {
    query: z.object({
      conversationId: z.string().optional(),
      phase: z
        .enum([
          'parse',
          'validate',
          'resolve',
          'plan',
          'approve',
          'execute',
          'error',
        ])
        .optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.coerce.number().positive().optional(),
      offset: z.coerce.number().nonnegative().optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: z.array(
          z.object({
            id: z.string(),
            timestamp: z.string(),
            conversationId: z.string().optional(),
            planId: z.string().optional(),
            phase: z.string(),
            input: z.unknown(),
            output: z.unknown(),
            userId: z.string().optional(),
            durationMs: z.number(),
          }),
        ),
      }),
      'Audit log entries',
    ),
  },
});

export const historyApp = new OpenAPIHono();

historyApp.openapi(historyRoute, async (c) => {
  const filters = c.req.valid('query');
  const entries = await auditLogger.getEntries(filters);

  return c.json({ success: true as const, data: entries }, HttpStatusCodes.OK);
});
