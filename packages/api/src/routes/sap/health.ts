import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { executeHttpRequest } from '@sap-cloud-sdk/http-client';
import { getSapDestination } from '../../config/destination.js';

const SapHealthResponseSchema = z
  .object({
    status: z.enum(['connected', 'error']),
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
  const start = Date.now();
  try {
    await executeHttpRequest(getSapDestination(), {
      method: 'get',
      url: '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/',
      headers: {
        'x-csrf-token': 'Fetch',
        'sap-client': getSapDestination().sapClient ?? '',
        'sap-language': 'EN',
      },
    });

    return c.json(
      {
        status: 'connected' as const,
        responseTimeMs: Date.now() - start,
      },
      HttpStatusCodes.OK,
    );
  } catch (error: unknown) {
    // Any HTTP response (even 4xx) means SAP is reachable
    if (
      error instanceof Error &&
      typeof (error as unknown as Record<string, unknown>).response === 'object'
    ) {
      return c.json(
        {
          status: 'connected' as const,
          responseTimeMs: Date.now() - start,
        },
        HttpStatusCodes.OK,
      );
    }

    return c.json(
      {
        status: 'error' as const,
        responseTimeMs: Date.now() - start,
        message:
          error instanceof Error ? error.message : 'Unknown connection error',
      },
      HttpStatusCodes.SERVICE_UNAVAILABLE,
    );
  }
});

export { app as sapHealthApp };
