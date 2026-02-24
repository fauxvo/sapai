import { executeHttpRequest } from '@sap-cloud-sdk/http-client';
import { getSapDestination } from '../config/destination.js';

export type SapHealthStatus = 'connected' | 'degraded' | 'error';

export interface SapHealthResult {
  status: SapHealthStatus;
  authenticated: boolean | null;
  responseTimeMs: number;
  message?: string;
}

const TIMEOUT_RESULT = Symbol('timeout');

/**
 * Lightweight SAP connectivity check. Hits the PO OData service root
 * with a CSRF-token fetch. Uses Promise.race to enforce a hard timeout
 * because the SAP Cloud SDK does not support AbortController.
 *
 * @param timeoutMs  Max time to wait (default 5 000 ms)
 */
export async function checkSapHealth(
  timeoutMs = 5000,
): Promise<SapHealthResult> {
  const start = Date.now();

  const destination = getSapDestination();
  const httpCall = executeHttpRequest(
    destination,
    {
      method: 'get',
      url: '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/',
      headers: {
        'x-csrf-token': 'Fetch',
        'sap-client': destination.sapClient ?? '',
        'sap-language': 'EN',
      },
    },
    { fetchCsrfToken: false },
  );

  const timeout = new Promise<typeof TIMEOUT_RESULT>((resolve) =>
    setTimeout(() => resolve(TIMEOUT_RESULT), timeoutMs),
  );

  try {
    const result = await Promise.race([httpCall, timeout]);

    if (result === TIMEOUT_RESULT) {
      return {
        status: 'error',
        authenticated: null,
        responseTimeMs: Date.now() - start,
        message: `SAP health check timed out after ${timeoutMs}ms — system may be offline`,
      };
    }

    return {
      status: 'connected',
      authenticated: true,
      responseTimeMs: Date.now() - start,
    };
  } catch (error: unknown) {
    const elapsed = Date.now() - start;

    const response = (error as Record<string, unknown>)?.response as
      | Record<string, unknown>
      | undefined;

    // Got an HTTP response — SAP is reachable
    if (response && typeof response.status === 'number') {
      const httpStatus = response.status as number;

      if (httpStatus === 401 || httpStatus === 403) {
        return {
          status: 'degraded',
          authenticated: false,
          responseTimeMs: elapsed,
          message: `SAP returned ${httpStatus} — credentials may be invalid`,
        };
      }

      // Other HTTP errors — reachable, auth status ambiguous
      return {
        status: 'connected',
        authenticated: null,
        responseTimeMs: elapsed,
      };
    }

    // No HTTP response — network-level failure
    return {
      status: 'error',
      authenticated: null,
      responseTimeMs: elapsed,
      message:
        error instanceof Error ? error.message : 'Unknown connection error',
    };
  }
}
