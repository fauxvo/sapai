import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExecutionPlanCard } from '../ExecutionPlanCard';
import type { ExecutionPlan } from '@sapai/shared';

const mockPlan: ExecutionPlan = {
  planId: 'plan_abc123',
  createdAt: new Date().toISOString(),
  intents: [
    {
      intentId: 'DELETE_PURCHASE_ORDER',
      description: 'Delete PO 4500000001',
      apiCall: { method: 'DELETE', path: '/sap/purchase-orders/4500000001' },
      resolvedEntities: [],
      risks: ['This is a destructive operation'],
    },
  ],
  requiresApproval: true,
  summary: 'Delete PO 4500000001',
};

describe('ExecutionPlanCard', () => {
  it('renders plan summary', () => {
    render(
      <ExecutionPlanCard
        plan={mockPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    // Summary appears in both the plan summary <p> and the action description <p>
    const summaryElements = screen.getAllByText('Delete PO 4500000001');
    expect(summaryElements.length).toBeGreaterThanOrEqual(1);
    // The first occurrence is the plan summary paragraph
    expect(summaryElements[0].closest('p')?.className).toContain('mb-3');
  });

  it('renders action descriptions and API paths', () => {
    render(
      <ExecutionPlanCard
        plan={mockPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    // "Delete PO 4500000001" appears as both summary and action description
    const matches = screen.getAllByText('Delete PO 4500000001');
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText('/sap/purchase-orders/4500000001'),
    ).toBeInTheDocument();
  });

  it('shows DELETE method badge with red styling', () => {
    render(
      <ExecutionPlanCard
        plan={mockPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    const badge = screen.getByText('DELETE');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-700');
  });

  it('shows GET method badge with blue styling', () => {
    const getPlan: ExecutionPlan = {
      ...mockPlan,
      intents: [
        {
          intentId: 'READ_PO',
          description: 'Read PO',
          apiCall: { method: 'GET', path: '/sap/purchase-orders' },
          resolvedEntities: [],
          risks: [],
        },
      ],
    };
    render(
      <ExecutionPlanCard
        plan={getPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    const badge = screen.getByText('GET');
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-700');
  });

  it('shows POST method badge with green styling', () => {
    const postPlan: ExecutionPlan = {
      ...mockPlan,
      intents: [
        {
          intentId: 'CREATE_PO',
          description: 'Create PO',
          apiCall: { method: 'POST', path: '/sap/purchase-orders' },
          resolvedEntities: [],
          risks: [],
        },
      ],
    };
    render(
      <ExecutionPlanCard
        plan={postPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    const badge = screen.getByText('POST');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-700');
  });

  it('shows PATCH method badge with amber styling', () => {
    const patchPlan: ExecutionPlan = {
      ...mockPlan,
      intents: [
        {
          intentId: 'UPDATE_PO',
          description: 'Update PO',
          apiCall: { method: 'PATCH', path: '/sap/purchase-orders/123' },
          resolvedEntities: [],
          risks: [],
        },
      ],
    };
    render(
      <ExecutionPlanCard
        plan={patchPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    const badge = screen.getByText('PATCH');
    expect(badge.className).toContain('bg-amber-100');
    expect(badge.className).toContain('text-amber-700');
  });

  it('shows risk tags for destructive operations', () => {
    render(
      <ExecutionPlanCard
        plan={mockPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    const riskTag = screen.getByText('This is a destructive operation');
    expect(riskTag).toBeInTheDocument();
    expect(riskTag.className).toContain('bg-red-100');
    expect(riskTag.className).toContain('text-red-700');
  });

  it('approve button calls onApprove with planId', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    render(
      <ExecutionPlanCard
        plan={mockPlan}
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    );
    await user.click(screen.getByText('Approve & Execute'));
    expect(onApprove).toHaveBeenCalledWith('plan_abc123');
  });

  it('reject button calls onReject with planId', async () => {
    const user = userEvent.setup();
    const onReject = vi.fn();
    render(
      <ExecutionPlanCard
        plan={mockPlan}
        onApprove={vi.fn()}
        onReject={onReject}
      />,
    );
    await user.click(screen.getByText('Reject'));
    expect(onReject).toHaveBeenCalledWith('plan_abc123');
  });

  it('buttons disabled while isLoading=true', () => {
    render(
      <ExecutionPlanCard
        plan={mockPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        isLoading
      />,
    );
    expect(screen.getByText('Executing...')).toBeDisabled();
    expect(screen.getByText('Reject')).toBeDisabled();
  });

  it('shows "Approve & Execute" text when not loading', () => {
    render(
      <ExecutionPlanCard
        plan={mockPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        isLoading={false}
      />,
    );
    expect(screen.getByText('Approve & Execute')).toBeInTheDocument();
  });

  it('does not show risk tags when risks array is empty', () => {
    const noRiskPlan: ExecutionPlan = {
      ...mockPlan,
      intents: [
        {
          intentId: 'READ_PO',
          description: 'Read PO',
          apiCall: { method: 'GET', path: '/sap/purchase-orders' },
          resolvedEntities: [],
          risks: [],
        },
      ],
    };
    render(
      <ExecutionPlanCard
        plan={noRiskPlan}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    expect(
      screen.queryByText('This is a destructive operation'),
    ).not.toBeInTheDocument();
  });
});
