import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClarificationPrompt } from '../ClarificationPrompt';

describe('ClarificationPrompt', () => {
  it('renders the clarification message text', () => {
    render(
      <ClarificationPrompt
        message="Please provide more details about the purchase order."
        missingFields={['vendor', 'amount']}
      />,
    );
    expect(
      screen.getByText(
        'Please provide more details about the purchase order.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the "More information needed" heading', () => {
    render(
      <ClarificationPrompt
        message="Need more info"
        missingFields={['field1']}
      />,
    );
    expect(
      screen.getByText('More information needed'),
    ).toBeInTheDocument();
  });

  it('lists all missing fields as badges', () => {
    render(
      <ClarificationPrompt
        message="Missing required fields"
        missingFields={['vendor', 'amount', 'deliveryDate']}
      />,
    );
    expect(screen.getByText('vendor')).toBeInTheDocument();
    expect(screen.getByText('amount')).toBeInTheDocument();
    expect(screen.getByText('deliveryDate')).toBeInTheDocument();
  });

  it('missing field badges have correct styling', () => {
    render(
      <ClarificationPrompt
        message="Missing fields"
        missingFields={['vendor']}
      />,
    );
    const badge = screen.getByText('vendor');
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-700');
    expect(badge.className).toContain('rounded-full');
  });

  it('handles empty missingFields array', () => {
    const { container } = render(
      <ClarificationPrompt
        message="No specific fields missing, but need more context."
        missingFields={[]}
      />,
    );
    expect(
      screen.getByText(
        'No specific fields missing, but need more context.',
      ),
    ).toBeInTheDocument();
    // Should not render the flex wrapper for badges when no fields
    const badgeContainer = container.querySelector('.flex.flex-wrap');
    expect(badgeContainer).not.toBeInTheDocument();
  });

  it('renders within a blue-themed container', () => {
    const { container } = render(
      <ClarificationPrompt
        message="Info needed"
        missingFields={[]}
      />,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('bg-blue-50');
    expect(wrapper?.className).toContain('border-blue-200');
  });
});
