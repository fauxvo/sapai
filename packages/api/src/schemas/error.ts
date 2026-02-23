import { z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import type { SapBusinessError } from '../services/base/types.js';

export const ErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  severity: z.string(),
});

export const ErrorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      httpStatus: z.number(),
      code: z.string(),
      message: z.string(),
      details: z.array(ErrorDetailSchema),
    }),
  })
  .openapi('ErrorResponse');

/**
 * Standard error responses for all SAP-backed routes. Spread into the
 * `responses` object of every `createRoute` call so that `mapSapStatus`
 * can return any of these codes without Hono type errors.
 */
export const sapErrorResponses = {
  [HttpStatusCodes.BAD_REQUEST]: jsonContent(
    ErrorResponseSchema,
    'Validation error',
  ),
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
    ErrorResponseSchema,
    'Authentication required',
  ),
  [HttpStatusCodes.FORBIDDEN]: jsonContent(
    ErrorResponseSchema,
    'Insufficient permissions',
  ),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(
    ErrorResponseSchema,
    'Resource not found',
  ),
  [HttpStatusCodes.CONFLICT]: jsonContent(ErrorResponseSchema, 'Conflict'),
  [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
    ErrorResponseSchema,
    'SAP error',
  ),
} as const;

export const errJson = (error: SapBusinessError) =>
  ({ success: false as const, error }) as const;

/**
 * Strips SDK internal properties (circular refs, BigNumber instances, Moment
 * objects) by round-tripping through JSON. The generic lets callers keep their
 * Zod-inferred type while getting a plain JSON-safe object.
 *
 * Side-effects of JSON round-trip:
 * - `undefined` values are dropped from objects
 * - `Date` objects are converted to ISO 8601 strings
 * - `BigNumber` instances are converted to numbers (may lose precision)
 * - Functions and symbols are silently dropped
 */
export const sanitize = <T>(data: unknown): T =>
  JSON.parse(JSON.stringify(data)) as T;

/** The specific error status codes mapSapStatus can return. */
export type SapErrorStatus = 400 | 401 | 403 | 404 | 409 | 500;

const SAP_STATUS_MAP: Partial<Record<number, SapErrorStatus>> = {
  400: 400,
  401: 401,
  403: 403,
  404: 404,
  409: 409,
};

/**
 * Maps a SAP HTTP status to the appropriate HTTP status code for the response.
 * Returns 500 for any status not explicitly mapped.
 */
export function mapSapStatus(error: SapBusinessError): SapErrorStatus {
  return SAP_STATUS_MAP[error.httpStatus] ?? 500;
}
