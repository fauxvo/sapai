import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module to prevent bun:sqlite import in Node/vitest
vi.mock('../../db/index.js', () => ({ db: null }));

import { BusinessRulesEngine } from './BusinessRulesEngine.js';
import type { ParsedIntent, ResolvedEntity } from '@sapai/shared';

function makeIntent(
  intentId: string,
  fields: Record<string, unknown> = {},
): ParsedIntent {
  return {
    intentId,
    confidence: 0.95,
    extractedFields: fields,
  };
}

function makePOEntity(
  poNumber: string,
  overrides: Partial<{
    isDeleted: boolean;
    releaseNotCompleted: boolean;
    totalItems: number;
    currency: string;
    supplier: string;
  }> = {},
): ResolvedEntity {
  return {
    originalValue: poNumber,
    resolvedValue: poNumber,
    resolvedLabel: `PO ${poNumber}`,
    confidence: 'exact',
    matchType: 'po_lookup',
    entityType: 'purchaseOrder',
    metadata: {
      exists: true,
      poHeader: {
        poNumber,
        supplier: overrides.supplier ?? '17300001',
        companyCode: '1710',
        orderType: 'NB',
        purchasingOrg: '1710',
        purchasingGroup: '001',
        currency: overrides.currency ?? 'USD',
        paymentTerms: 'NET30',
        createdBy: 'TESTUSER',
        creationDate: '2025-01-01',
        isDeleted: overrides.isDeleted ?? false,
        releaseNotCompleted: overrides.releaseNotCompleted ?? false,
        totalItems: overrides.totalItems ?? 5,
        items: [],
      },
    },
  };
}

function makeItemEntity(
  itemNumber: string,
  overrides: Partial<{
    quantity: number;
    netPrice: number;
    isCompletelyDelivered: boolean;
    isFinallyInvoiced: boolean;
    purchasingDocumentDeletionCode: string;
  }> = {},
): ResolvedEntity {
  return {
    originalValue: `line ${itemNumber}`,
    resolvedValue: itemNumber.padStart(5, '0'),
    resolvedLabel: `Item ${itemNumber.padStart(5, '0')} — Test Material`,
    confidence: 'exact',
    matchType: 'numeric_pad',
    entityType: 'purchaseOrderItem',
    metadata: {
      itemNumber: itemNumber.padStart(5, '0'),
      description: 'Test Material',
      material: 'MAT-001',
      quantity: overrides.quantity ?? 100,
      unit: 'EA',
      netPrice: overrides.netPrice ?? 25.0,
      currency: 'USD',
      plant: '1710',
      isCompletelyDelivered: overrides.isCompletelyDelivered ?? false,
      isFinallyInvoiced: overrides.isFinallyInvoiced ?? false,
      purchasingDocumentDeletionCode:
        overrides.purchasingDocumentDeletionCode ?? '',
    },
  };
}

describe('BusinessRulesEngine', () => {
  let engine: BusinessRulesEngine;

  beforeEach(() => {
    engine = new BusinessRulesEngine();
  });

  // -----------------------------------------------------------------------
  // Read operations — should pass all rules
  // -----------------------------------------------------------------------
  it('passes all rules for read-only intents', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('GET_PURCHASE_ORDER', { poNumber: '4500000001' }),
        resolvedEntities: [makePOEntity('4500000001')],
      },
    ]);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // NEGATIVE_QUANTITY
  // -----------------------------------------------------------------------
  it('blocks negative quantity on UPDATE_PO_ITEM', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: -44,
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1'),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    const block = result.violations.find(
      (v) => v.ruleId === 'NEGATIVE_QUANTITY',
    );
    expect(block).toBeDefined();
    expect(block!.severity).toBe('block');
    expect(block!.field).toBe('quantity');
  });

  it('blocks negative quantity on ADD_PO_ITEM', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('ADD_PO_ITEM', {
          poNumber: '4500000001',
          quantity: -10,
          netPrice: 5.0,
        }),
        resolvedEntities: [makePOEntity('4500000001')],
      },
    ]);

    expect(result.passed).toBe(false);
    expect(
      result.violations.some((v) => v.ruleId === 'NEGATIVE_QUANTITY'),
    ).toBe(true);
  });

  // -----------------------------------------------------------------------
  // ZERO_QUANTITY
  // -----------------------------------------------------------------------
  it('warns on zero quantity', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 0,
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1'),
        ],
      },
    ]);

    expect(result.passed).toBe(true); // warn doesn't block
    const warn = result.violations.find(
      (v) => v.ruleId === 'ZERO_QUANTITY',
    );
    expect(warn).toBeDefined();
    expect(warn!.severity).toBe('warn');
  });

  // -----------------------------------------------------------------------
  // EXCESSIVE_QUANTITY
  // -----------------------------------------------------------------------
  it('warns on excessive quantity (> 999,999)', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 5_000_000,
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1'),
        ],
      },
    ]);

    expect(result.passed).toBe(true);
    const warn = result.violations.find(
      (v) => v.ruleId === 'EXCESSIVE_QUANTITY',
    );
    expect(warn).toBeDefined();
    expect(warn!.severity).toBe('warn');
  });

  // -----------------------------------------------------------------------
  // QUANTITY_SPIKE
  // -----------------------------------------------------------------------
  it('warns on 5x+ quantity increase', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 600, // 6x the current 100
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', { quantity: 100 }),
        ],
      },
    ]);

    expect(result.passed).toBe(true);
    const warn = result.violations.find(
      (v) => v.ruleId === 'QUANTITY_SPIKE',
    );
    expect(warn).toBeDefined();
    expect(warn!.message).toContain('6x');
  });

  it('does not warn on reasonable quantity increase', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 200, // 2x, reasonable
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', { quantity: 100 }),
        ],
      },
    ]);

    expect(
      result.violations.some((v) => v.ruleId === 'QUANTITY_SPIKE'),
    ).toBe(false);
  });

  // -----------------------------------------------------------------------
  // QUANTITY_CLIFF
  // -----------------------------------------------------------------------
  it('warns on >90% quantity drop', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 5, // 95% drop from 100
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', { quantity: 100 }),
        ],
      },
    ]);

    const warn = result.violations.find(
      (v) => v.ruleId === 'QUANTITY_CLIFF',
    );
    expect(warn).toBeDefined();
    expect(warn!.severity).toBe('warn');
  });

  // -----------------------------------------------------------------------
  // PRICE_MODIFICATION_BLOCKED
  // -----------------------------------------------------------------------
  it('blocks price modification on existing items', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          netPrice: 99.99,
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', { netPrice: 25.0 }),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    const block = result.violations.find(
      (v) => v.ruleId === 'PRICE_MODIFICATION_BLOCKED',
    );
    expect(block).toBeDefined();
    expect(block!.severity).toBe('block');
    expect(block!.field).toBe('netPrice');
  });

  it('does NOT block price on new item creation', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('ADD_PO_ITEM', {
          poNumber: '4500000001',
          netPrice: 50.0,
          quantity: 10,
        }),
        resolvedEntities: [makePOEntity('4500000001')],
      },
    ]);

    expect(
      result.violations.some(
        (v) => v.ruleId === 'PRICE_MODIFICATION_BLOCKED',
      ),
    ).toBe(false);
  });

  // -----------------------------------------------------------------------
  // NEGATIVE_PRICE
  // -----------------------------------------------------------------------
  it('blocks negative price on ADD_PO_ITEM', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('ADD_PO_ITEM', {
          poNumber: '4500000001',
          netPrice: -10.0,
          quantity: 5,
        }),
        resolvedEntities: [makePOEntity('4500000001')],
      },
    ]);

    expect(result.passed).toBe(false);
    expect(
      result.violations.some((v) => v.ruleId === 'NEGATIVE_PRICE'),
    ).toBe(true);
  });

  it('blocks negative price in CREATE_PURCHASE_ORDER items array', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('CREATE_PURCHASE_ORDER', {
          companyCode: '1710',
          orderType: 'NB',
          supplier: '17300001',
          purchasingOrg: '1710',
          purchasingGroup: '001',
          currency: 'USD',
          items: [
            { material: 'MAT-001', quantity: 10, netPrice: 5.0 },
            { material: 'MAT-002', quantity: 5, netPrice: -3.0 },
          ],
        }),
        resolvedEntities: [],
      },
    ]);

    expect(result.passed).toBe(false);
    const priceViolation = result.violations.find(
      (v) => v.ruleId === 'NEGATIVE_PRICE',
    );
    expect(priceViolation).toBeDefined();
    expect(priceViolation!.field).toBe('items[1].netPrice');
  });

  // -----------------------------------------------------------------------
  // DELETED_PO_MODIFICATION
  // -----------------------------------------------------------------------
  it('blocks modification on deleted PO', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 50,
        }),
        resolvedEntities: [
          makePOEntity('4500000001', { isDeleted: true }),
          makeItemEntity('1'),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    const block = result.violations.find(
      (v) => v.ruleId === 'DELETED_PO_MODIFICATION',
    );
    expect(block).toBeDefined();
    expect(block!.severity).toBe('block');
  });

  it('blocks adding items to deleted PO', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('ADD_PO_ITEM', {
          poNumber: '4500000001',
          quantity: 10,
          netPrice: 5.0,
        }),
        resolvedEntities: [
          makePOEntity('4500000001', { isDeleted: true }),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    expect(
      result.violations.some(
        (v) => v.ruleId === 'DELETED_PO_MODIFICATION',
      ),
    ).toBe(true);
  });

  // -----------------------------------------------------------------------
  // RELEASED_PO_WARNING
  // -----------------------------------------------------------------------
  it('warns when modifying PO with incomplete release', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_HEADER', {
          poNumber: '4500000001',
          paymentTerms: 'NET60',
        }),
        resolvedEntities: [
          makePOEntity('4500000001', { releaseNotCompleted: true }),
        ],
      },
    ]);

    expect(result.passed).toBe(true); // warn doesn't block
    const warn = result.violations.find(
      (v) => v.ruleId === 'RELEASED_PO_WARNING',
    );
    expect(warn).toBeDefined();
    expect(warn!.message).toContain('incomplete release');
  });

  // -----------------------------------------------------------------------
  // LAST_ITEM_DELETE
  // -----------------------------------------------------------------------
  it('warns when deleting last item on PO', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('DELETE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
        }),
        resolvedEntities: [
          makePOEntity('4500000001', { totalItems: 1 }),
          makeItemEntity('1'),
        ],
      },
    ]);

    const warn = result.violations.find(
      (v) => v.ruleId === 'LAST_ITEM_DELETE',
    );
    expect(warn).toBeDefined();
    expect(warn!.severity).toBe('warn');
  });

  // -----------------------------------------------------------------------
  // SUPPLIER_CHANGE
  // -----------------------------------------------------------------------
  it('warns on supplier change', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_HEADER', {
          poNumber: '4500000001',
          supplier: '17300099',
        }),
        resolvedEntities: [
          makePOEntity('4500000001', { supplier: '17300001' }),
        ],
      },
    ]);

    const warn = result.violations.find(
      (v) => v.ruleId === 'SUPPLIER_CHANGE',
    );
    expect(warn).toBeDefined();
    expect(warn!.message).toContain('17300001');
    expect(warn!.message).toContain('17300099');
  });

  // -----------------------------------------------------------------------
  // CURRENCY_CHANGE_BLOCKED
  // -----------------------------------------------------------------------
  it('blocks currency change on existing PO', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_HEADER', {
          poNumber: '4500000001',
          documentCurrency: 'EUR',
        }),
        resolvedEntities: [
          makePOEntity('4500000001', { currency: 'USD' }),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    const block = result.violations.find(
      (v) => v.ruleId === 'CURRENCY_CHANGE_BLOCKED',
    );
    expect(block).toBeDefined();
    expect(block!.message).toContain('USD');
    expect(block!.message).toContain('EUR');
  });

  it('allows same currency (no-op)', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_HEADER', {
          poNumber: '4500000001',
          documentCurrency: 'USD',
        }),
        resolvedEntities: [
          makePOEntity('4500000001', { currency: 'USD' }),
        ],
      },
    ]);

    expect(
      result.violations.some(
        (v) => v.ruleId === 'CURRENCY_CHANGE_BLOCKED',
      ),
    ).toBe(false);
  });

  // -----------------------------------------------------------------------
  // DELETE_PO_SAFETY
  // -----------------------------------------------------------------------
  it('provides safety info for PO deletion', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('DELETE_PURCHASE_ORDER', {
          poNumber: '4500000001',
        }),
        resolvedEntities: [
          makePOEntity('4500000001', { totalItems: 3 }),
        ],
      },
    ]);

    const info = result.violations.find(
      (v) => v.ruleId === 'DELETE_PO_SAFETY',
    );
    expect(info).toBeDefined();
    expect(info!.severity).toBe('info');
    expect(info!.message).toContain('3 line item(s)');
  });

  // -----------------------------------------------------------------------
  // DELIVERED_ITEM_MODIFICATION
  // -----------------------------------------------------------------------
  it('blocks quantity change on fully delivered item', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 50,
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', { isCompletelyDelivered: true }),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    const block = result.violations.find(
      (v) => v.ruleId === 'DELIVERED_ITEM_MODIFICATION',
    );
    expect(block).toBeDefined();
  });

  it('allows non-quantity changes on delivered item', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          description: 'New description',
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', { isCompletelyDelivered: true }),
        ],
      },
    ]);

    expect(
      result.violations.some(
        (v) => v.ruleId === 'DELIVERED_ITEM_MODIFICATION',
      ),
    ).toBe(false);
  });

  // -----------------------------------------------------------------------
  // INVOICED_ITEM_MODIFICATION
  // -----------------------------------------------------------------------
  it('blocks modification on finally invoiced item', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 50,
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', { isFinallyInvoiced: true }),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    const block = result.violations.find(
      (v) => v.ruleId === 'INVOICED_ITEM_MODIFICATION',
    );
    expect(block).toBeDefined();
  });

  it('blocks deletion of finally invoiced item', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('DELETE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', { isFinallyInvoiced: true }),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    expect(
      result.violations.some(
        (v) => v.ruleId === 'INVOICED_ITEM_MODIFICATION',
      ),
    ).toBe(true);
  });

  // -----------------------------------------------------------------------
  // DELETED_ITEM_MODIFICATION
  // -----------------------------------------------------------------------
  it('blocks modification on deleted item', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 50,
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', {
            purchasingDocumentDeletionCode: 'L',
          }),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    const block = result.violations.find(
      (v) => v.ruleId === 'DELETED_ITEM_MODIFICATION',
    );
    expect(block).toBeDefined();
  });

  // -----------------------------------------------------------------------
  // ITEMS_NEGATIVE_QUANTITY (CREATE_PURCHASE_ORDER items array)
  // -----------------------------------------------------------------------
  it('blocks negative quantity in CREATE_PO items array', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('CREATE_PURCHASE_ORDER', {
          companyCode: '1710',
          orderType: 'NB',
          supplier: '17300001',
          purchasingOrg: '1710',
          purchasingGroup: '001',
          currency: 'USD',
          items: [
            { material: 'MAT-001', quantity: 10, netPrice: 5.0 },
            { material: 'MAT-002', quantity: -5, netPrice: 3.0 },
          ],
        }),
        resolvedEntities: [],
      },
    ]);

    expect(result.passed).toBe(false);
    const block = result.violations.find(
      (v) => v.ruleId === 'ITEMS_NEGATIVE_QUANTITY',
    );
    expect(block).toBeDefined();
    expect(block!.field).toBe('items[1].quantity');
  });

  // -----------------------------------------------------------------------
  // LOW_CONFIDENCE_ENTITY
  // -----------------------------------------------------------------------
  it('warns on low confidence entity for write operation', () => {
    const lowConfEntity: ResolvedEntity = {
      originalValue: 'the brakes',
      resolvedValue: '00030',
      resolvedLabel: 'Item 00030 — Brake pads',
      confidence: 'low',
      matchType: 'fuzzy',
      entityType: 'purchaseOrderItem',
    };

    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'the brakes',
          quantity: 50,
        }),
        resolvedEntities: [makePOEntity('4500000001'), lowConfEntity],
      },
    ]);

    const warn = result.violations.find(
      (v) => v.ruleId === 'LOW_CONFIDENCE_ENTITY',
    );
    expect(warn).toBeDefined();
    expect(warn!.severity).toBe('warn');
  });

  // -----------------------------------------------------------------------
  // Multiple violations in one evaluation
  // -----------------------------------------------------------------------
  it('collects multiple violations from one intent', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: -44,
          netPrice: 99.99,
        }),
        resolvedEntities: [
          makePOEntity('4500000001', { isDeleted: true }),
          makeItemEntity('1'),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    // Should have: NEGATIVE_QUANTITY, PRICE_MODIFICATION_BLOCKED, DELETED_PO_MODIFICATION
    const ruleIds = result.violations.map((v) => v.ruleId);
    expect(ruleIds).toContain('NEGATIVE_QUANTITY');
    expect(ruleIds).toContain('PRICE_MODIFICATION_BLOCKED');
    expect(ruleIds).toContain('DELETED_PO_MODIFICATION');
  });

  // -----------------------------------------------------------------------
  // Clean update passes all rules
  // -----------------------------------------------------------------------
  it('passes for a clean quantity update', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: 150,
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1', { quantity: 100 }),
        ],
      },
    ]);

    // Should only have non-blocking violations (if any)
    expect(result.passed).toBe(true);
    const blocks = result.violations.filter((v) => v.severity === 'block');
    expect(blocks).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // Multi-intent evaluation
  // -----------------------------------------------------------------------
  it('evaluates multiple intents independently', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('GET_PURCHASE_ORDER', {
          poNumber: '4500000001',
        }),
        resolvedEntities: [makePOEntity('4500000001')],
      },
      {
        intent: makeIntent('UPDATE_PO_ITEM', {
          poNumber: '4500000001',
          itemIdentifier: 'line 1',
          quantity: -10,
        }),
        resolvedEntities: [
          makePOEntity('4500000001'),
          makeItemEntity('1'),
        ],
      },
    ]);

    expect(result.passed).toBe(false);
    // Only the UPDATE should have violations, not the GET
    expect(
      result.violations.every(
        (v) => v.intentId === 'UPDATE_PO_ITEM',
      ),
    ).toBe(true);
  });

  // -----------------------------------------------------------------------
  // checksPerformed and rulesPassed counters
  // -----------------------------------------------------------------------
  it('tracks checksPerformed and rulesPassed', () => {
    const result = engine.evaluate([
      {
        intent: makeIntent('GET_PURCHASE_ORDER', {
          poNumber: '4500000001',
        }),
        resolvedEntities: [makePOEntity('4500000001')],
      },
    ]);

    // Read intents skip most rules (which are for create/update/delete)
    // No rules target 'read' category, so checksPerformed is 0
    expect(result.checksPerformed).toBe(0);
    expect(result.rulesPassed).toBe(0);
    expect(result.violations).toHaveLength(0);
  });
});
