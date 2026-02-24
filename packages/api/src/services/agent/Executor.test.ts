import { describe, it, expect, vi } from 'vitest';
import type { ExecutionPlan } from '@sapai/shared';

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

import { Executor } from './Executor.js';

function createMockPOService() {
  return {
    getById: vi.fn().mockResolvedValue({
      success: true,
      data: { purchaseOrder: '4500000001', supplier: '17300001' },
    }),
    getAll: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getItems: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getItem: vi.fn().mockResolvedValue({
      success: true,
      data: { purchaseOrderItem: '00010' },
    }),
    updateItem: vi.fn().mockResolvedValue({
      success: true,
      data: { purchaseOrderItem: '00010', orderQuantity: 44 },
    }),
    updateHeader: vi.fn().mockResolvedValue({ success: true, data: {} }),
    create: vi.fn().mockResolvedValue({ success: true, data: {} }),
    addItem: vi.fn().mockResolvedValue({ success: true, data: {} }),
    delete: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    deleteItem: vi.fn().mockResolvedValue({ success: true, data: undefined }),
  } as unknown as NonNullable<ConstructorParameters<typeof Executor>[0]>;
}

function createMockAuditLogger(): NonNullable<
  ConstructorParameters<typeof Executor>[1]
> {
  return {
    log: vi.fn().mockResolvedValue({}),
  } as unknown as NonNullable<ConstructorParameters<typeof Executor>[1]>;
}

describe('Executor', () => {
  it('executes a read plan successfully', async () => {
    const poService = createMockPOService();
    const auditLogger = createMockAuditLogger();
    const executor = new Executor(poService, auditLogger);

    const plan: ExecutionPlan = {
      planId: 'plan_test1',
      createdAt: new Date().toISOString(),
      requiresApproval: false,
      summary: 'Get PO',
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          description: 'Retrieve PO 4500000001',
          apiCall: { method: 'GET', path: '/sap/purchase-orders/4500000001' },
          resolvedEntities: [],
          risks: [],
        },
      ],
    };

    const result = await executor.execute(plan);

    expect(result.overallSuccess).toBe(true);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].success).toBe(true);
    expect(poService.getById).toHaveBeenCalledWith('4500000001');
    expect(auditLogger.log).toHaveBeenCalled();
  });

  it('executes an update plan', async () => {
    const poService = createMockPOService();
    const auditLogger = createMockAuditLogger();
    const executor = new Executor(poService, auditLogger);

    const plan: ExecutionPlan = {
      planId: 'plan_test2',
      createdAt: new Date().toISOString(),
      requiresApproval: true,
      summary: 'Update item',
      intents: [
        {
          intentId: 'UPDATE_PO_ITEM',
          description: 'Update quantity',
          apiCall: {
            method: 'PATCH',
            path: '/sap/purchase-orders/4500000001/items/00010',
            body: { quantity: 44 },
          },
          resolvedEntities: [],
          risks: [],
        },
      ],
    };

    const result = await executor.execute(plan);

    expect(result.overallSuccess).toBe(true);
    expect(poService.updateItem).toHaveBeenCalledWith('4500000001', '00010', {
      quantity: 44,
    });
  });

  it('handles execution failure gracefully', async () => {
    const poService = createMockPOService();
    (poService.getById as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: {
        message: 'PO not found',
        httpStatus: 404,
        code: 'NOT_FOUND',
        details: [],
      },
    });
    const auditLogger = createMockAuditLogger();
    const executor = new Executor(poService, auditLogger);

    const plan: ExecutionPlan = {
      planId: 'plan_test3',
      createdAt: new Date().toISOString(),
      requiresApproval: false,
      summary: 'Get PO',
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          description: 'Retrieve PO',
          apiCall: { method: 'GET', path: '/sap/purchase-orders/9999999999' },
          resolvedEntities: [],
          risks: [],
        },
      ],
    };

    const result = await executor.execute(plan);

    expect(result.overallSuccess).toBe(false);
    expect(result.results[0].success).toBe(false);
    expect(result.results[0].error).toBe('PO not found');
  });

  it('executes multi-intent plans', async () => {
    const poService = createMockPOService();
    const auditLogger = createMockAuditLogger();
    const executor = new Executor(poService, auditLogger);

    const plan: ExecutionPlan = {
      planId: 'plan_test4',
      createdAt: new Date().toISOString(),
      requiresApproval: true,
      summary: 'Get PO then update',
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          description: 'Get PO',
          apiCall: { method: 'GET', path: '/sap/purchase-orders/4500000001' },
          resolvedEntities: [],
          risks: [],
        },
        {
          intentId: 'UPDATE_PO_ITEM',
          description: 'Update item',
          apiCall: {
            method: 'PATCH',
            path: '/sap/purchase-orders/4500000001/items/00010',
            body: { quantity: 44 },
          },
          resolvedEntities: [],
          risks: [],
        },
      ],
    };

    const result = await executor.execute(plan);

    expect(result.overallSuccess).toBe(true);
    expect(result.results).toHaveLength(2);
    expect(auditLogger.log).toHaveBeenCalledTimes(2);
  });

  it('handles delete operations', async () => {
    const poService = createMockPOService();
    const auditLogger = createMockAuditLogger();
    const executor = new Executor(poService, auditLogger);

    const plan: ExecutionPlan = {
      planId: 'plan_test5',
      createdAt: new Date().toISOString(),
      requiresApproval: true,
      summary: 'Delete PO',
      intents: [
        {
          intentId: 'DELETE_PURCHASE_ORDER',
          description: 'Delete PO 4500000001',
          apiCall: {
            method: 'DELETE',
            path: '/sap/purchase-orders/4500000001',
          },
          resolvedEntities: [],
          risks: ['This is a destructive operation'],
        },
      ],
    };

    const result = await executor.execute(plan);

    expect(result.overallSuccess).toBe(true);
    expect(poService.delete).toHaveBeenCalledWith('4500000001');
  });
});
