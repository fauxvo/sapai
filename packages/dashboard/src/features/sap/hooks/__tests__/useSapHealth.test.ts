import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useSapHealth } from '../useSapHealth';

// Mock useAuthToken to return a fake token
const mockGetToken = vi.fn().mockResolvedValue('test-token');
vi.mock('../../../agent/hooks/useAuthToken', () => ({
  useAuthToken: () => mockGetToken,
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

describe('useSapHealth', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            status: 'connected',
            authenticated: true,
            responseTimeMs: 200,
          }),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches health status from /sap/health with auth header', async () => {
    const { result } = renderHook(() => useSapHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      status: 'connected',
      authenticated: true,
      responseTimeMs: 200,
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/sap/health'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      }),
    );
  });

  it('handles 503 response without throwing', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({
          status: 'error',
          authenticated: null,
          message: 'SAP system appears to be offline',
        }),
    } as Response);

    const { result } = renderHook(() => useSapHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.status).toBe('error');
    expect(result.current.data?.message).toBe(
      'SAP system appears to be offline',
    );
  });

  it('returns error status for unexpected response shape', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({ error: 'proxy timeout', code: 502 }),
    } as Response);

    const { result } = renderHook(() => useSapHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.status).toBe('error');
    expect(result.current.data?.message).toBe('Unexpected response');
  });

  it('returns error status for unknown status values', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({ status: 'maintenance', authenticated: null }),
    } as Response);

    const { result } = renderHook(() => useSapHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.status).toBe('error');
  });

  it('returns error status when res.json() throws (HTML error page)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    } as Response);

    const { result } = renderHook(() => useSapHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.status).toBe('error');
    expect(result.current.data?.message).toBe('Non-JSON response');
  });

  it('returns error status when API returns 401 (Clerk auth rejection)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    } as Response);

    const { result } = renderHook(() => useSapHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // 401 body has no valid status field, so it falls through to error sentinel
    expect(result.current.data?.status).toBe('error');
    expect(result.current.data?.message).toBe('Unexpected response');
  });

  it('sends no auth header when token is undefined', async () => {
    mockGetToken.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSapHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/sap/health'),
      expect.objectContaining({ headers: {} }),
    );
  });

  it('enters error state when fetch rejects (network down)', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useSapHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });
  });
});
