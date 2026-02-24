import { describe, it, expect, vi } from 'vitest';
import type { ParsedIntent } from '@sapai/shared';

// Mock environment and db
vi.mock('../../config/environment.js', () => ({
  env: {
    ANTHROPIC_API_KEY: 'test',
    ANTHROPIC_MODEL: 'test',
    AGENT_CONFIDENCE_THRESHOLD: 0.6,
  },
}));
vi.mock('../../db/index.js', () => ({ db: null }));
vi.mock('../../config/destination.js', () => ({
  getSapDestination: () => ({ url: 'http://mock' }),
}));

import { EntityResolver } from './EntityResolver.js';

function createMockPOService(
  items: Array<{
    purchaseOrderItem: string;
    purchaseOrderItemText?: string;
    material?: string;
  }>,
) {
  return {
    getItems: vi.fn().mockResolvedValue({
      success: true,
      data: items,
    }),
  } as unknown as ConstructorParameters<typeof EntityResolver>[0];
}

describe('EntityResolver', () => {
  it('resolves numeric item identifiers as exact match', async () => {
    const resolver = new EntityResolver(createMockPOService([]));
    const result = await resolver.resolvePOItem('4500000001', '10');

    expect(result.confidence).toBe('exact');
    expect(result.resolvedValue).toBe('00010');
  });

  it('resolves fuzzy text match against item descriptions', async () => {
    const mockService = createMockPOService([
      {
        purchaseOrderItem: '00010',
        purchaseOrderItemText: 'Forks',
        material: 'TG11',
      },
      {
        purchaseOrderItem: '00020',
        purchaseOrderItemText: 'Spoons',
        material: 'TG12',
      },
    ]);

    const resolver = new EntityResolver(mockService);
    const result = await resolver.resolvePOItem('4500000001', 'forks');

    expect(result.confidence).toBe('exact');
    expect(result.resolvedValue).toBe('00010');
    expect(result.resolvedLabel).toContain('Forks');
  });

  it('resolves substring match', async () => {
    const mockService = createMockPOService([
      {
        purchaseOrderItem: '00010',
        purchaseOrderItemText: 'Stainless Steel Forks',
        material: 'TG11',
      },
      {
        purchaseOrderItem: '00020',
        purchaseOrderItemText: 'Spoons',
        material: 'TG12',
      },
    ]);

    const resolver = new EntityResolver(mockService);
    const result = await resolver.resolvePOItem('4500000001', 'fork');

    expect(result.confidence).toBe('high');
    expect(result.resolvedValue).toBe('00010');
  });

  it('returns ambiguous when multiple matches', async () => {
    const mockService = createMockPOService([
      {
        purchaseOrderItem: '00010',
        purchaseOrderItemText: 'Steel Forks',
        material: 'TG11',
      },
      {
        purchaseOrderItem: '00020',
        purchaseOrderItemText: 'Plastic Forks',
        material: 'TG13',
      },
    ]);

    const resolver = new EntityResolver(mockService);
    const result = await resolver.resolvePOItem('4500000001', 'forks');

    expect(result.confidence).toBe('ambiguous');
    expect(result.candidates).toHaveLength(2);
  });

  it('returns low confidence when no match', async () => {
    const mockService = createMockPOService([
      {
        purchaseOrderItem: '00010',
        purchaseOrderItemText: 'Forks',
        material: 'TG11',
      },
    ]);

    const resolver = new EntityResolver(mockService);
    const result = await resolver.resolvePOItem('4500000001', 'knives');

    expect(result.confidence).toBe('low');
  });

  it('handles SAP API failure gracefully', async () => {
    const mockService = {
      getItems: vi.fn().mockResolvedValue({
        success: false,
        error: { message: 'SAP error' },
      }),
    } as unknown as ConstructorParameters<typeof EntityResolver>[0];

    const resolver = new EntityResolver(mockService);
    const result = await resolver.resolvePOItem('4500000001', 'forks');

    expect(result.confidence).toBe('low');
    expect(result.resolvedLabel).toContain('Could not fetch');
  });

  it('resolve() updates extractedFields with resolved itemId', async () => {
    const mockService = createMockPOService([
      {
        purchaseOrderItem: '00010',
        purchaseOrderItemText: 'Forks',
        material: 'TG11',
      },
    ]);

    const resolver = new EntityResolver(mockService);
    const intent: ParsedIntent = {
      intentId: 'UPDATE_PO_ITEM',
      confidence: 0.9,
      extractedFields: {
        poNumber: '4500000001',
        itemIdentifier: 'forks',
        quantity: 44,
      },
    };

    const result = await resolver.resolve(intent);

    expect(result.resolvedEntities).toHaveLength(1);
    expect(result.intent.extractedFields.itemId).toBe('00010');
  });
});
