import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { executeHttpRequest } from '@sap-cloud-sdk/http-client';
import { getSapDestination } from '../../config/destination.js';

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
        authenticated: true,
        responseTimeMs: Date.now() - start,
      },
      HttpStatusCodes.OK,
    );
  } catch (error: unknown) {
    const elapsed = Date.now() - start;
    const response = (error as Record<string, unknown>)?.response as
      | Record<string, unknown>
      | undefined;

    // Got an HTTP response — SAP is reachable
    if (response && typeof response.status === 'number') {
      const httpStatus = response.status as number;

      if (httpStatus === 401 || httpStatus === 403) {
        return c.json(
          {
            status: 'degraded' as const,
            authenticated: false,
            responseTimeMs: elapsed,
            message: `SAP returned ${httpStatus} — check SAP_USERNAME / SAP_PASSWORD credentials and user authorizations`,
          },
          HttpStatusCodes.OK,
        );
      }

      // Other HTTP errors (404, 500, etc.) — reachable but auth status is
      // ambiguous (a 500 could occur before authentication is evaluated)
      return c.json(
        {
          status: 'connected' as const,
          authenticated: null,
          responseTimeMs: elapsed,
        },
        HttpStatusCodes.OK,
      );
    }

    // No HTTP response at all — network-level failure
    return c.json(
      {
        status: 'error' as const,
        authenticated: false,
        responseTimeMs: elapsed,
        message:
          error instanceof Error ? error.message : 'Unknown connection error',
      },
      HttpStatusCodes.SERVICE_UNAVAILABLE,
    );
  }
});

export { app as sapHealthApp };
