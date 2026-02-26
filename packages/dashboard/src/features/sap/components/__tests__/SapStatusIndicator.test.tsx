import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SapStatusIndicator } from '../SapStatusIndicator';

// Mock the useSapHealth hook
const mockUseSapHealth = vi.fn();
vi.mock('../../hooks/useSapHealth', () => ({
  useSapHealth: () => mockUseSapHealth(),
}));

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('SapStatusIndicator', () => {
  beforeEach(() => {
    mockUseSapHealth.mockReset();
  });

  it('shows loading state', () => {
    mockUseSapHealth.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    renderWithQuery(<SapStatusIndicator />);
    expect(screen.getByText('SAP')).toBeInTheDocument();
  });

  it('shows "SAP Online" with green dot when connected', () => {
    mockUseSapHealth.mockReturnValue({
      data: {
        status: 'connected',
        authenticated: true,
        responseTimeMs: 234,
      },
      isLoading: false,
      isError: false,
    });
    const { container } = renderWithQuery(<SapStatusIndicator />);
    expect(screen.getByText('SAP Online')).toBeInTheDocument();
    expect(container.querySelector('.bg-emerald-500')).toBeInTheDocument();
  });

  it('does not show ping animation when connected', () => {
    mockUseSapHealth.mockReturnValue({
      data: { status: 'connected', authenticated: true },
      isLoading: false,
      isError: false,
    });
    const { container } = renderWithQuery(<SapStatusIndicator />);
    expect(container.querySelector('.animate-ping')).not.toBeInTheDocument();
  });

  it('shows "SAP Degraded" with amber dot when degraded', () => {
    mockUseSapHealth.mockReturnValue({
      data: {
        status: 'degraded',
        authenticated: false,
        message: 'Invalid credentials',
      },
      isLoading: false,
      isError: false,
    });
    const { container } = renderWithQuery(<SapStatusIndicator />);
    expect(screen.getByText('SAP Degraded')).toBeInTheDocument();
    expect(container.querySelector('.bg-amber-500')).toBeInTheDocument();
  });

  it('shows "SAP Offline" with red dot when error', () => {
    mockUseSapHealth.mockReturnValue({
      data: { status: 'error', authenticated: null, message: 'Timed out' },
      isLoading: false,
      isError: false,
    });
    const { container } = renderWithQuery(<SapStatusIndicator />);
    expect(screen.getByText('SAP Offline')).toBeInTheDocument();
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
  });

  it('shows ping animation when not connected', () => {
    mockUseSapHealth.mockReturnValue({
      data: { status: 'error', authenticated: null },
      isLoading: false,
      isError: false,
    });
    const { container } = renderWithQuery(<SapStatusIndicator />);
    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
  });

  it('shows "SAP Unknown" when API fetch fails', () => {
    mockUseSapHealth.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    renderWithQuery(<SapStatusIndicator />);
    expect(screen.getByText('SAP Unknown')).toBeInTheDocument();
  });

  it('includes response time in tooltip when available', () => {
    mockUseSapHealth.mockReturnValue({
      data: {
        status: 'connected',
        authenticated: true,
        responseTimeMs: 150,
      },
      isLoading: false,
      isError: false,
    });
    renderWithQuery(<SapStatusIndicator />);
    const indicator = screen.getByText('SAP Online').closest('div');
    expect(indicator?.getAttribute('title')).toContain('150ms');
  });

  it('includes message in tooltip when available', () => {
    mockUseSapHealth.mockReturnValue({
      data: {
        status: 'error',
        authenticated: null,
        message: 'Connection refused',
      },
      isLoading: false,
      isError: false,
    });
    renderWithQuery(<SapStatusIndicator />);
    const indicator = screen.getByText('SAP Offline').closest('div');
    expect(indicator?.getAttribute('title')).toContain('Connection refused');
  });

  it('falls back to error config for unexpected status values', () => {
    mockUseSapHealth.mockReturnValue({
      data: { status: 'something_unexpected', authenticated: null },
      isLoading: false,
      isError: false,
    });
    const { container } = renderWithQuery(<SapStatusIndicator />);
    // Should render error styling instead of crashing
    expect(screen.getByText('SAP Offline')).toBeInTheDocument();
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
  });
});
