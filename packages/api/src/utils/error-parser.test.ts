import { describe, it, expect } from 'vitest';
import { parseSapError } from './error-parser.js';

describe('parseSapError', () => {
  it('parses full SAP error with innererror.errordetails', () => {
    const error = Object.assign(new Error('SAP request failed'), {
      response: {
        status: 400,
        data: {
          error: {
            code: 'BAPI_ERROR',
            message: { value: 'Purchase order creation failed' },
            innererror: {
              errordetails: [
                {
                  code: 'ME/001',
                  message: 'Material 12345 does not exist',
                  severity: 'error',
                },
                {
                  code: 'ME/002',
                  message: 'Plant 1000 is not valid',
                  severity: 'warning',
                },
              ],
            },
          },
        },
      },
    });

    const result = parseSapError(error);

    expect(result.httpStatus).toBe(400);
    expect(result.code).toBe('BAPI_ERROR');
    expect(result.message).toBe('Purchase order creation failed');
    expect(result.details).toHaveLength(2);
    expect(result.details[0]).toEqual({
      code: 'ME/001',
      message: 'Material 12345 does not exist',
      severity: 'error',
    });
    expect(result.details[1]).toEqual({
      code: 'ME/002',
      message: 'Plant 1000 is not valid',
      severity: 'warning',
    });
  });

  it('parses SAP error with no innererror', () => {
    const error = Object.assign(new Error('SAP request failed'), {
      response: {
        status: 403,
        data: {
          error: {
            code: 'AUTH/001',
            message: { value: 'Not authorized' },
          },
        },
      },
    });

    const result = parseSapError(error);

    expect(result.httpStatus).toBe(403);
    expect(result.code).toBe('AUTH/001');
    expect(result.message).toBe('Not authorized');
    expect(result.details).toEqual([]);
  });

  it('handles network error with no SAP body', () => {
    const error = new Error('ECONNREFUSED');

    const result = parseSapError(error);

    expect(result.httpStatus).toBe(500);
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toBe('ECONNREFUSED');
    expect(result.details).toEqual([]);
  });

  it('handles non-Error thrown values (string)', () => {
    const result = parseSapError('something went wrong');

    expect(result.httpStatus).toBe(500);
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('something went wrong');
    expect(result.details).toEqual([]);
  });

  it('handles non-Error thrown values (null)', () => {
    const result = parseSapError(null);

    expect(result.httpStatus).toBe(500);
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('Unknown error');
    expect(result.details).toEqual([]);
  });

  it('handles SDK-wrapped error via rootCause path', () => {
    const error = Object.assign(new Error('Request failed'), {
      rootCause: Object.assign(new Error('Inner error'), {
        response: {
          status: 422,
          data: {
            error: {
              code: 'CX_SXML_PARSE_ERROR',
              message: { value: 'Invalid XML payload' },
              innererror: {
                errordetails: [
                  {
                    code: 'XML/001',
                    message: 'Unexpected element at position 42',
                    severity: 'error',
                  },
                ],
              },
            },
          },
        },
      }),
    });

    const result = parseSapError(error);

    expect(result.httpStatus).toBe(422);
    expect(result.code).toBe('CX_SXML_PARSE_ERROR');
    expect(result.message).toBe('Invalid XML payload');
    expect(result.details).toHaveLength(1);
    expect(result.details[0].message).toBe('Unexpected element at position 42');
  });

  it('handles SAP error with string message (not object)', () => {
    const error = Object.assign(new Error('SAP request failed'), {
      response: {
        status: 500,
        data: {
          error: {
            code: 'SY/530',
            message: 'Internal server error',
          },
        },
      },
    });

    const result = parseSapError(error);

    expect(result.httpStatus).toBe(500);
    expect(result.code).toBe('SY/530');
    expect(result.message).toBe('Internal server error');
  });
});
