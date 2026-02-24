import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RetryBar } from '../RetryBar';

describe('RetryBar', () => {
  it('shows error message', () => {
    render(
      <RetryBar
        errorMessage="Connection timed out"
        retryCount={1}
        maxRetries={3}
        onRetry={vi.fn()}
        onEditRetry={vi.fn()}
      />,
    );
    expect(screen.getByText('Connection timed out')).toBeInTheDocument();
  });

  it('shows retry count out of max', () => {
    render(
      <RetryBar
        errorMessage="Error"
        retryCount={2}
        maxRetries={3}
        onRetry={vi.fn()}
        onEditRetry={vi.fn()}
      />,
    );
    expect(screen.getByText('Retry (2/3)')).toBeInTheDocument();
  });

  it('retry button calls onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <RetryBar
        errorMessage="Error"
        retryCount={1}
        maxRetries={3}
        onRetry={onRetry}
        onEditRetry={vi.fn()}
      />,
    );
    await user.click(screen.getByText('Retry (1/3)'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('Edit & Retry button calls onEditRetry', async () => {
    const user = userEvent.setup();
    const onEditRetry = vi.fn();
    render(
      <RetryBar
        errorMessage="Error"
        retryCount={1}
        maxRetries={3}
        onRetry={vi.fn()}
        onEditRetry={onEditRetry}
      />,
    );
    await user.click(screen.getByText('Edit & Retry'));
    expect(onEditRetry).toHaveBeenCalledTimes(1);
  });

  it('when retryCount >= maxRetries, retry button is hidden and max retries message shown', () => {
    render(
      <RetryBar
        errorMessage="Error"
        retryCount={3}
        maxRetries={3}
        onRetry={vi.fn()}
        onEditRetry={vi.fn()}
      />,
    );
    // Retry button should not be present
    expect(screen.queryByText(/^Retry \(/)).not.toBeInTheDocument();
    // Max retries message should be shown
    expect(
      screen.getByText(
        'Maximum retries reached. Please try a different message.',
      ),
    ).toBeInTheDocument();
  });

  it('Edit & Retry is always available even when max retries reached', () => {
    render(
      <RetryBar
        errorMessage="Error"
        retryCount={3}
        maxRetries={3}
        onRetry={vi.fn()}
        onEditRetry={vi.fn()}
      />,
    );
    expect(screen.getByText('Edit & Retry')).toBeInTheDocument();
  });

  it('does not show max retries message when retryCount < maxRetries', () => {
    render(
      <RetryBar
        errorMessage="Error"
        retryCount={1}
        maxRetries={3}
        onRetry={vi.fn()}
        onEditRetry={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(
        'Maximum retries reached. Please try a different message.',
      ),
    ).not.toBeInTheDocument();
  });

  it('renders within a red-themed container', () => {
    const { container } = render(
      <RetryBar
        errorMessage="Error"
        retryCount={0}
        maxRetries={3}
        onRetry={vi.fn()}
        onEditRetry={vi.fn()}
      />,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('bg-red-50');
    expect(wrapper?.className).toContain('border-red-200');
  });
});
