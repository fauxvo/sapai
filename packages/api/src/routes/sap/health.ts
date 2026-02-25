import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { checkSapHealth } from '../../utils/sap-health.js';

const SapHealthResponseSchema = z
  .object({
    status: z.enum(['connected', 'degraded', 'error']),
    authenticated: z.boolean().nullable(),
    responseTimeMs: z.number().optional(),
    message: z.string().optional(),
  })
  .openapi('SapHealthResponse');

const sapHealthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['SAP'],
  summary: 'SAP connectivity health check',
  description:
    'Checks connectivity to the SAP S/4HANA system by making a lightweight request.',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      SapHealthResponseSchema,
      'SAP system connectivity status',
    ),
    [HttpStatusCodes.SERVICE_UNAVAILABLE]: jsonContent(
      SapHealthResponseSchema,
      'SAP system is unreachable',
    ),
  },
});

const app = new OpenAPIHono();

app.openapi(sapHealthRoute, async (c) => {
  const result = await checkSapHealth();

  const httpStatus =
    result.status === 'error'
      ? HttpStatusCodes.SERVICE_UNAVAILABLE
      : HttpStatusCodes.OK;

  return c.json(result, httpStatus);
});

export { app as sapHealthApp };
