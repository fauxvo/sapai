import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  CreateAccountAssignmentInput,
  UpdateAccountAssignmentInput,
} from './types.js';

// Mock the generated service before importing
const mockGetByKey = vi.fn();
const mockGetAll = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const mockRequestBuilder = {
  getByKey: mockGetByKey,
  getAll: mockGetAll,
  create: mockCreate,
  update: mockUpdate,
  delete: mockDelete,
};

const mockPurOrdAccountAssignmentApi = {
  requestBuilder: () => mockRequestBuilder,
  entityBuilder: () => ({
    purchaseOrder: vi.fn().mockReturnThis(),
    purchaseOrderItem: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({}),
  }),
  schema: {
    PURCHASE_ORDER: { equals: vi.fn() },
    PURCHASE_ORDER_ITEM: { equals: vi.fn() },
  },
};

// Mock for PO existence check (separate request builder)
const mockPoCheckGetByKey = vi.fn();
const mockPurchaseOrderApi = {
  requestBuilder: () => ({ getByKey: mockPoCheckGetByKey }),
  schema: { PURCHASE_ORDER: {} },
};

// Mock for PO item existence check
const mockItemCheckGetByKey = vi.fn();
const mockPurchaseOrderItemApi = {
  requestBuilder: () => ({ getByKey: mockItemCheckGetByKey }),
  schema: { PURCHASE_ORDER: {}, PURCHASE_ORDER_ITEM: {} },
};

vi.mock('../../generated/purchase-order-service/service.js', () => ({
  purchaseOrderService: () => ({
    purchaseOrderApi: mockPurchaseOrderApi,
    purchaseOrderItemApi: mockPurchaseOrderItemApi,
    purOrdAccountAssignmentApi: mockPurOrdAccountAssignmentApi,
  }),
}));

vi.mock('../../config/destination.js', () => ({
  getSapDestination: () => ({
    url: 'https://mock-sap:44300',
    username: 'test',
    password: 'test',
    authentication: 'BasicAuthentication',
    sapClient: '100',
  }),
}));

// Import after mocks
const { PurchaseOrderAccountAssignmentService } =
  await import('./PurchaseOrderAccountAssignmentService.js');

describe('PurchaseOrderAccountAssignmentService', () => {
  let service: InstanceType<typeof PurchaseOrderAccountAssignmentService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PurchaseOrderAccountAssignmentService();
  });

  describe('getAccountAssignments', () => {
    it('returns list of account assignments (no extra SAP call)', async () => {
      const mockAssignments = [
        {
          purchaseOrder: '4500000001',
          purchaseOrderItem: '10',
          accountAssignmentNumber: '01',
          glAccount: '0000400000',
          costCenter: '0000001000',
        },
      ];
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockAssignments),
      });
      mockGetAll.mockReturnValue({ filter: filterMock });

      const result = await service.getAccountAssignments('4500000001', '10');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toHaveLength(1);
      expect(result.data[0].accountAssignmentNumber).toBe('01');
      expect(mockPoCheckGetByKey).not.toHaveBeenCalled();
    });

    it('returns 404 when parent PO does not exist', async () => {
      // getAll returns empty
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      mockGetAll.mockReturnValue({ filter: filterMock });
      // PO check fails
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: '/IWBEP/CM_MGW_RT/020',
            message: {
              value: "Resource not found for segment 'A_PurchaseOrderType'",
            },
          },
        },
      };
      mockPoCheckGetByKey.mockReturnValue({
        select: vi.fn().mockReturnValue({
          execute: vi.fn().mockRejectedValue(sapError),
        }),
      });

      const result = await service.getAccountAssignments('4500005678', '10');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.httpStatus).toBe(404);
    });
  });

  describe('getAccountAssignmentByKey', () => {
    it('returns a single account assignment', async () => {
      const mockAssignment = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        accountAssignmentNumber: '01',
        glAccount: '0000400000',
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockAssignment),
      });

      const result = await service.getAccountAssignmentByKey(
        '4500000001',
        '10',
        '01',
      );

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockAssignment);
      expect(mockGetByKey).toHaveBeenCalledWith('4500000001', '10', '01');
    });

    it('returns fail result on SAP error', async () => {
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Account assignment not found' },
          },
        },
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });

      const result = await service.getAccountAssignmentByKey(
        '4500000001',
        '10',
        '99',
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('SY/530');
    });
  });

  describe('createAccountAssignment', () => {
    it('creates an account assignment on a PO item', async () => {
      const mockCreated = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        accountAssignmentNumber: '01',
        glAccount: '0000400000',
        costCenter: '0000001000',
      };
      mockCreate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockCreated),
      });

      const input: CreateAccountAssignmentInput = {
        glAccount: '0000400000',
        costCenter: '0000001000',
        quantity: 100,
      };

      const result = await service.createAccountAssignment(
        '4500000001',
        '10',
        input,
      );

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockCreated);
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  describe('updateAccountAssignment', () => {
    it('reads entity first then updates', async () => {
      const existingAssignment = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        accountAssignmentNumber: '01',
        glAccount: '0000400000',
        costCenter: '0000001000',
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingAssignment),
      });
      mockUpdate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingAssignment),
      });

      const changes: UpdateAccountAssignmentInput = {
        costCenter: '0000002000',
      };
      const result = await service.updateAccountAssignment(
        '4500000001',
        '10',
        '01',
        changes,
      );

      expect(result.success).toBe(true);
      expect(mockGetByKey).toHaveBeenCalledWith('4500000001', '10', '01');
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('deleteAccountAssignment', () => {
    it('calls delete with PO, item, and assignment keys', async () => {
      mockDelete.mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      });

      const result = await service.deleteAccountAssignment(
        '4500000001',
        '10',
        '01',
      );

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('4500000001', '10', '01');
    });
  });
});
