import type {
  SapBusinessError,
  SapErrorDetail,
} from '../services/base/types.js';

interface SapODataError {
  error?: {
    code?: string;
    message?: { value?: string } | string;
    innererror?: {
      errordetails?: Array<{
        code?: string;
        message?: string;
        severity?: string;
      }>;
    };
  };
}

export function parseSapError(error: unknown): SapBusinessError {
  // Handle non-Error values
  if (!(error instanceof Error)) {
    return {
      httpStatus: 500,
      code: 'UNKNOWN_ERROR',
      message: String(error ?? 'Unknown error'),
      details: [],
    };
  }

  // Try to extract SAP OData error body
  const sapBody = extractSapBody(error);
  if (sapBody?.error) {
    const sapError = sapBody.error;
    const message =
      typeof sapError.message === 'object'
        ? (sapError.message?.value ?? 'SAP Error')
        : (sapError.message ?? 'SAP Error');

    const details: SapErrorDetail[] = (
      sapError.innererror?.errordetails ?? []
    ).map((d) => ({
      code: d.code ?? '',
      message: d.message ?? '',
      severity: d.severity ?? 'error',
    }));

    return {
      httpStatus: extractHttpStatus(error) ?? 500,
      code: sapError.code ?? 'SAP_ERROR',
      message,
      details,
    };
  }

  // Network or other errors with no SAP payload
  return {
    httpStatus: extractHttpStatus(error) ?? 500,
    code: 'NETWORK_ERROR',
    message: error.message,
    details: [],
  };
}

function extractSapBody(error: unknown): SapODataError | undefined {
  if (typeof error !== 'object' || error === null) return undefined;

  const err = error as Record<string, unknown>;

  // Direct response.data (from axios-style errors)
  if (hasResponseData(err)) {
    return err.response.data as SapODataError;
  }

  // SAP Cloud SDK wraps errors — dig into rootCause
  if (hasRootCause(err)) {
    return extractSapBody(err.rootCause);
  }

  // The error itself might have a cause property
  if ('cause' in err && typeof err.cause === 'object') {
    return extractSapBody(err.cause);
  }

  return undefined;
}

function extractHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const err = error as Record<string, unknown>;

  // Direct status properties
  if (typeof err.status === 'number') return err.status;
  if (typeof err.statusCode === 'number') return err.statusCode;

  // Nested response.status
  if (
    typeof err.response === 'object' &&
    err.response !== null &&
    typeof (err.response as Record<string, unknown>).status === 'number'
  ) {
    return (err.response as Record<string, unknown>).status as number;
  }

  // SAP Cloud SDK rootCause
  if (hasRootCause(err)) {
    return extractHttpStatus(err.rootCause);
  }

  return undefined;
}

function hasResponseData(err: Record<string, unknown>): err is Record<
  string,
  unknown
> & {
  response: { data: unknown };
} {
  return (
    typeof err.response === 'object' &&
    err.response !== null &&
    'data' in (err.response as Record<string, unknown>)
  );
}

function hasRootCause(
  err: Record<string, unknown>,
): err is Record<string, unknown> & { rootCause: unknown } {
  return 'rootCause' in err && err.rootCause != null;
}
