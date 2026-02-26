import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useSapHealth } from '../useSapHealth';

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

  it('fetches health status from /sap/health', async () => {
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
