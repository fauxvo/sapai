import { describe, it, expect, vi } from 'vitest';

vi.mock('../../config/environment.js', () => ({
  env: {
    ANTHROPIC_API_KEY: 'test',
    ANTHROPIC_MODEL: 'test',
    AGENT_CONFIDENCE_THRESHOLD: 0.6,
  },
}));
vi.mock('../../db/index.js', () => ({ db: null }));

import { PlanBuilder } from './PlanBuilder.js';

describe('PlanBuilder', () => {
  const builder = new PlanBuilder();

  it('builds a plan for a read intent (no approval)', () => {
    const plan = builder.build([
      {
        intent: {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.95,
          extractedFields: { poNumber: '4500000001' },
        },
        resolvedEntities: [],
      },
    ]);

    expect(plan.planId).toMatch(/^plan_/);
    expect(plan.requiresApproval).toBe(false);
    expect(plan.intents).toHaveLength(1);
    expect(plan.intents[0].apiCall.method).toBe('GET');
    expect(plan.intents[0].apiCall.path).toBe(
      '/sap/purchase-orders/4500000001',
    );
  });

  it('builds a plan for a write intent (requires approval)', () => {
    const plan = builder.build([
      {
        intent: {
          intentId: 'UPDATE_PO_ITEM',
          confidence: 0.9,
          extractedFields: {
            poNumber: '4500000001',
            itemIdentifier: 'forks',
            itemId: '00010',
            quantity: 44,
          },
        },
        resolvedEntities: [
          {
            originalValue: 'forks',
            resolvedValue: '00010',
            resolvedLabel: 'Item 00010 — Forks',
            confidence: 'exact',
          },
        ],
      },
    ]);

    expect(plan.requiresApproval).toBe(true);
    expect(plan.intents[0].apiCall.path).toBe(
      '/sap/purchase-orders/4500000001/items/00010',
    );
    expect(plan.intents[0].apiCall.body).toEqual({ quantity: 44 });
  });

  it('sorts reads before writes in multi-intent plans', () => {
    const plan = builder.build([
      {
        intent: {
          intentId: 'UPDATE_PO_ITEM',
          confidence: 0.9,
          extractedFields: {
            poNumber: '4500000001',
            itemId: '00010',
            quantity: 44,
          },
        },
        resolvedEntities: [],
      },
      {
        intent: {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.95,
          extractedFields: { poNumber: '4500000001' },
        },
        resolvedEntities: [],
      },
    ]);

    expect(plan.intents[0].intentId).toBe('GET_PURCHASE_ORDER');
    expect(plan.intents[1].intentId).toBe('UPDATE_PO_ITEM');
  });

  it('flags delete operations as risky', () => {
    const plan = builder.build([
      {
        intent: {
          intentId: 'DELETE_PURCHASE_ORDER',
          confidence: 0.95,
          extractedFields: { poNumber: '4500000001' },
        },
        resolvedEntities: [],
      },
    ]);

    expect(plan.requiresApproval).toBe(true);
    expect(plan.intents[0].risks).toContain('This is a destructive operation');
  });

  it('generates a summary from action descriptions', () => {
    const plan = builder.build([
      {
        intent: {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.95,
          extractedFields: { poNumber: '4500000001' },
        },
        resolvedEntities: [],
      },
    ]);

    expect(plan.summary).toContain('PO 4500000001');
  });
});
