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
    orderQuantity?: unknown;
    purchaseOrderQuantityUnit?: string;
    netPriceAmount?: unknown;
    documentCurrency?: string;
    plant?: string;
  }>,
  poExists = true,
) {
  const poData = {
    purchaseOrder: '4500000001',
    companyCode: '1710',
    purchaseOrderType: 'NB',
    supplier: '17300001',
    purchasingOrganization: '1710',
    purchasingGroup: '001',
    documentCurrency: 'USD',
    paymentTerms: 'NT30',
    createdByUser: 'TESTUSER',
    creationDate: null,
    purchasingDocumentDeletionCode: '',
    releaseIsNotCompleted: false,
    toPurchaseOrderItem: items,
  };

  return {
    getById: vi
      .fn()
      .mockResolvedValue(
        poExists
          ? { success: true, data: poData }
          : { success: false, error: { message: 'Not found' } },
      ),
    getItems: vi.fn().mockResolvedValue({
      success: true,
      data: items,
    }),
    getItem: vi.fn().mockImplementation((_poId: string, itemNum: string) => {
      const match = items.find((i) => i.purchaseOrderItem === itemNum);
      return Promise.resolve(
        match
          ? { success: true, data: match }
          : { success: false, error: { message: 'Not found' } },
      );
    }),
  } as unknown as ConstructorParameters<typeof EntityResolver>[0];
}

function makeIntent(
  intentId: string,
  fields: Record<string, unknown>,
): ParsedIntent {
  return { intentId, confidence: 0.9, extractedFields: fields };
}

describe('EntityResolver', () => {
  describe('PO Validation', () => {
    it('validates PO exists and returns header summary', async () => {
      const mockService = createMockPOService([
        { purchaseOrderItem: '00010', purchaseOrderItemText: 'Forks' },
      ]);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('GET_PURCHASE_ORDER', {
        poNumber: '4500000001',
      });

      const result = await resolver.resolve(intent);

      const poEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrder',
      );
      expect(poEntity).toBeDefined();
      expect(poEntity!.confidence).toBe('exact');
      expect(poEntity!.matchType).toBe('po_lookup');
      expect(poEntity!.resolvedLabel).toContain('PO 4500000001');
      expect(poEntity!.resolvedLabel).toContain('Supplier: 17300001');
      expect(poEntity!.resolvedLabel).toContain('1 item(s)');
      expect(poEntity!.metadata?.exists).toBe(true);
    });

    it('returns low confidence when PO does not exist', async () => {
      const mockService = createMockPOService([], false);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('GET_PURCHASE_ORDER', {
        poNumber: '9999999999',
      });

      const result = await resolver.resolve(intent);

      const poEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrder',
      );
      expect(poEntity).toBeDefined();
      expect(poEntity!.confidence).toBe('low');
      expect(poEntity!.resolvedLabel).toContain('not found');
      expect(poEntity!.metadata?.exists).toBe(false);
    });
  });

  describe('Item Resolution — numeric', () => {
    it('resolves numeric item identifiers and validates existence', async () => {
      const mockService = createMockPOService([
        { purchaseOrderItem: '00010', purchaseOrderItemText: 'Forks' },
      ]);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: '10',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity).toBeDefined();
      expect(itemEntity!.confidence).toBe('exact');
      expect(itemEntity!.resolvedValue).toBe('00010');
      expect(itemEntity!.matchType).toBe('numeric_pad');
    });

    it('returns low confidence when numeric item does not exist on PO', async () => {
      const mockService = createMockPOService([
        { purchaseOrderItem: '00010', purchaseOrderItemText: 'Forks' },
      ]);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: '99',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity).toBeDefined();
      expect(itemEntity!.confidence).toBe('low');
      expect(itemEntity!.resolvedLabel).toContain('does not exist');
    });
  });

  describe('Item Resolution — natural language item numbers', () => {
    it('resolves "line 6" as item number 00006', async () => {
      const mockService = createMockPOService([
        { purchaseOrderItem: '00006', purchaseOrderItemText: 'Widgets' },
        { purchaseOrderItem: '00010', purchaseOrderItemText: 'Forks' },
      ]);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'Line 6',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity).toBeDefined();
      expect(itemEntity!.confidence).toBe('exact');
      expect(itemEntity!.resolvedValue).toBe('00006');
      expect(itemEntity!.matchType).toBe('numeric_pad');
    });

    it('resolves "item #10" as item number 00010', async () => {
      const mockService = createMockPOService([
        { purchaseOrderItem: '00010', purchaseOrderItemText: 'Forks' },
      ]);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'item #10',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity!.confidence).toBe('exact');
      expect(itemEntity!.resolvedValue).toBe('00010');
    });

    it('resolves "line item 6" as item number 00006', async () => {
      const mockService = createMockPOService([
        { purchaseOrderItem: '00006', purchaseOrderItemText: 'Widgets' },
      ]);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'line item 6',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity!.confidence).toBe('exact');
      expect(itemEntity!.resolvedValue).toBe('00006');
    });

    it('resolves via direct API lookup when cached items use non-standard numbering', async () => {
      // Simulate PO with unpadded item numbers (e.g., "1", "2", "6" instead of "00001")
      const unpaddedItems = [
        { purchaseOrderItem: '1', purchaseOrderItemText: 'Bolts' },
        { purchaseOrderItem: '2', purchaseOrderItemText: 'Handle Bars' },
        { purchaseOrderItem: '6', purchaseOrderItemText: 'Brakes' },
      ];
      const mockService = createMockPOService(unpaddedItems);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'Line 6',
        quantity: 75,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity).toBeDefined();
      expect(itemEntity!.confidence).toBe('exact');
      expect(itemEntity!.resolvedValue).toBe('6');
      expect(itemEntity!.resolvedLabel).toContain('Brakes');
    });

    it('returns low confidence when "line 99" does not exist on PO', async () => {
      const mockService = createMockPOService([
        { purchaseOrderItem: '00010', purchaseOrderItemText: 'Forks' },
      ]);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'line 99',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity!.confidence).toBe('low');
      expect(itemEntity!.resolvedLabel).toContain('does not exist');
    });
  });

  describe('Item Resolution — text matching', () => {
    it('resolves exact text match against item descriptions', async () => {
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
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'forks',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity!.confidence).toBe('exact');
      expect(itemEntity!.resolvedValue).toBe('00010');
      expect(itemEntity!.matchType).toBe('exact_text');
      expect(itemEntity!.resolvedLabel).toContain('Forks');
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
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'fork',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity!.confidence).toBe('high');
      expect(itemEntity!.resolvedValue).toBe('00010');
      expect(itemEntity!.matchType).toBe('substring');
    });

    it('returns ambiguous when multiple substring matches', async () => {
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
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'forks',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity!.confidence).toBe('ambiguous');
      expect(itemEntity!.candidates).toHaveLength(2);
    });
  });

  describe('Item Resolution — fuzzy matching', () => {
    it('resolves close typos via Levenshtein distance', async () => {
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
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'froks',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity).toBeDefined();
      expect(itemEntity!.matchType).toBe('fuzzy');
      expect(itemEntity!.confidence).toBe('high');
      expect(itemEntity!.resolvedValue).toBe('00010');
    });

    it('returns low confidence when no fuzzy match either', async () => {
      const mockService = createMockPOService([
        {
          purchaseOrderItem: '00010',
          purchaseOrderItemText: 'Forks',
          material: 'TG11',
        },
      ]);

      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'xxxxxxxxx',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);
      const itemEntity = result.resolvedEntities.find(
        (e) => e.entityType === 'purchaseOrderItem',
      );

      expect(itemEntity!.confidence).toBe('low');
      expect(itemEntity!.matchType).toBe('none');
    });
  });

  describe('resolve() integration', () => {
    it('updates extractedFields with resolved itemId', async () => {
      const mockService = createMockPOService([
        {
          purchaseOrderItem: '00010',
          purchaseOrderItemText: 'Forks',
          material: 'TG11',
        },
      ]);

      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'forks',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);

      // Should have PO validation + item resolution
      expect(result.resolvedEntities).toHaveLength(2);
      expect(result.intent.extractedFields.itemId).toBe('00010');
    });

    it('includes both PO and item entities in resolved output', async () => {
      const mockService = createMockPOService([
        {
          purchaseOrderItem: '00010',
          purchaseOrderItemText: 'Forks',
          material: 'TG11',
        },
      ]);

      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('UPDATE_PO_ITEM', {
        poNumber: '4500000001',
        itemIdentifier: 'forks',
        quantity: 44,
      });

      const result = await resolver.resolve(intent);

      const types = result.resolvedEntities.map((e) => e.entityType);
      expect(types).toContain('purchaseOrder');
      expect(types).toContain('purchaseOrderItem');
    });

    it('skips entity resolution for intents without poNumber', async () => {
      const mockService = createMockPOService([]);
      const resolver = new EntityResolver(mockService);
      const intent = makeIntent('LIST_PURCHASE_ORDERS', {
        top: 10,
      });

      const result = await resolver.resolve(intent);

      expect(result.resolvedEntities).toHaveLength(0);
    });
  });
});
