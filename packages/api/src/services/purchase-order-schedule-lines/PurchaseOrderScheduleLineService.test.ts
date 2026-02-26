import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CreateScheduleLineInput } from './types.js';

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

const mockPurchaseOrderScheduleLineApi = {
  requestBuilder: () => mockRequestBuilder,
  entityBuilder: () => ({
    purchasingDocument: vi.fn().mockReturnThis(),
    purchasingDocumentItem: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({}),
  }),
  schema: {
    PURCHASING_DOCUMENT: { equals: vi.fn() },
    PURCHASING_DOCUMENT_ITEM: { equals: vi.fn() },
    SCHEDULE_LINE: { equals: vi.fn() },
  },
};

// Subcontracting components use a separate request builder so the mocks don't collide
const mockCompGetByKey = vi.fn();
const mockCompGetAll = vi.fn();
const mockCompCreate = vi.fn();
const mockCompUpdate = vi.fn();
const mockCompDelete = vi.fn();

const mockCompRequestBuilder = {
  getByKey: mockCompGetByKey,
  getAll: mockCompGetAll,
  create: mockCompCreate,
  update: mockCompUpdate,
  delete: mockCompDelete,
};

const mockPoSubcontractingComponentApi = {
  requestBuilder: () => mockCompRequestBuilder,
  schema: {
    PURCHASE_ORDER: { equals: vi.fn() },
    PURCHASE_ORDER_ITEM: { equals: vi.fn() },
    SCHEDULE_LINE: { equals: vi.fn() },
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
    purchaseOrderScheduleLineApi: mockPurchaseOrderScheduleLineApi,
    poSubcontractingComponentApi: mockPoSubcontractingComponentApi,
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
const { PurchaseOrderScheduleLineService } =
  await import('./PurchaseOrderScheduleLineService.js');

describe('PurchaseOrderScheduleLineService', () => {
  let service: InstanceType<typeof PurchaseOrderScheduleLineService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PurchaseOrderScheduleLineService();
  });

  // ---------------------------------------------------------------------------
  // Schedule Lines
  // ---------------------------------------------------------------------------

  describe('getScheduleLines', () => {
    it('returns ok result on success (no extra SAP call)', async () => {
      const mockLines = [
        {
          purchasingDocument: '4500000001',
          purchasingDocumentItem: '10',
          scheduleLine: '0001',
        },
      ];
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockLines),
      });
      mockGetAll.mockReturnValue({ filter: filterMock });

      const result = await service.getScheduleLines('4500000001', '10');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockLines);
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

      const result = await service.getScheduleLines('4500005678', '10');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.httpStatus).toBe(404);
    });
  });

  describe('getScheduleLineByKey', () => {
    it('returns ok result on success', async () => {
      const mockLine = {
        purchasingDocument: '4500000001',
        purchasingDocumentItem: '10',
        scheduleLine: '0001',
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockLine),
      });

      const result = await service.getScheduleLineByKey(
        '4500000001',
        '10',
        '0001',
      );

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockLine);
      expect(mockGetByKey).toHaveBeenCalledWith('4500000001', '10', '0001');
    });

    it('returns fail result on SAP error', async () => {
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Schedule line not found' },
          },
        },
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });

      const result = await service.getScheduleLineByKey(
        '4500000001',
        '10',
        '9999',
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('SY/530');
    });
  });

  describe('createScheduleLine', () => {
    it('calls create with entity', async () => {
      const mockCreated = {
        purchasingDocument: '4500000001',
        purchasingDocumentItem: '10',
        scheduleLine: '0002',
      };
      mockCreate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockCreated),
      });

      const input: CreateScheduleLineInput = {
        scheduleLineOrderQuantity: 100,
        scheduleLineDeliveryDate: '2026-03-15',
      };

      const result = await service.createScheduleLine(
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

  describe('deleteScheduleLine', () => {
    it('calls delete with correct keys', async () => {
      mockDelete.mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      });

      const result = await service.deleteScheduleLine(
        '4500000001',
        '10',
        '0001',
      );

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('4500000001', '10', '0001');
    });
  });

  // ---------------------------------------------------------------------------
  // Subcontracting Components
  // ---------------------------------------------------------------------------

  describe('getComponents', () => {
    it('returns ok result on success (no extra SAP call)', async () => {
      const mockComponents = [
        {
          purchaseOrder: '4500000001',
          purchaseOrderItem: '10',
          scheduleLine: '0001',
          reservationItem: '0001',
          recordType: 'M',
        },
      ];
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockComponents),
      });
      mockCompGetAll.mockReturnValue({ filter: filterMock });

      const result = await service.getComponents('4500000001', '10', '0001');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockComponents);
      expect(mockPoCheckGetByKey).not.toHaveBeenCalled();
    });

    it('returns 404 when parent PO does not exist', async () => {
      // getAll returns empty
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      mockCompGetAll.mockReturnValue({ filter: filterMock });
      // PO check fails with 404
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

      const result = await service.getComponents(
        '4500005678',
        '10',
        '0001',
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.httpStatus).toBe(404);
    });

    it('returns 404 when schedule line does not exist', async () => {
      // getAll returns empty
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      mockCompGetAll.mockReturnValue({ filter: filterMock });
      // PO check passes
      mockPoCheckGetByKey.mockReturnValue({
        select: vi.fn().mockReturnValue({
          execute: vi
            .fn()
            .mockResolvedValue({ purchaseOrder: '4500000001' }),
        }),
      });
      // Item check passes
      mockItemCheckGetByKey.mockReturnValue({
        select: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue({
            purchaseOrder: '4500000001',
            purchaseOrderItem: '10',
          }),
        }),
      });
      // Schedule line check fails with 404
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: '/IWBEP/CM_MGW_RT/020',
            message: {
              value:
                "Resource not found for segment 'A_PurchaseOrderScheduleLineType'",
            },
          },
        },
      };
      mockGetByKey.mockReturnValue({
        select: vi.fn().mockReturnValue({
          execute: vi.fn().mockRejectedValue(sapError),
        }),
      });

      const result = await service.getComponents(
        '4500000001',
        '10',
        '9999',
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.httpStatus).toBe(404);
    });

    it('returns empty array when non-404 error during existence check', async () => {
      // getAll returns empty (legitimate empty result)
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      mockCompGetAll.mockReturnValue({ filter: filterMock });
      // PO check passes
      mockPoCheckGetByKey.mockReturnValue({
        select: vi.fn().mockReturnValue({
          execute: vi
            .fn()
            .mockResolvedValue({ purchaseOrder: '4500000001' }),
        }),
      });
      // Item check passes
      mockItemCheckGetByKey.mockReturnValue({
        select: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue({
            purchaseOrder: '4500000001',
            purchaseOrderItem: '10',
          }),
        }),
      });
      // Schedule line check fails with 503 (not 404)
      const sapError = new Error('Service unavailable');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 503,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Service unavailable' },
          },
        },
      };
      mockGetByKey.mockReturnValue({
        select: vi.fn().mockReturnValue({
          execute: vi.fn().mockRejectedValue(sapError),
        }),
      });

      const result = await service.getComponents(
        '4500000001',
        '10',
        '0001',
      );

      // Should return the original empty success, not the 503
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual([]);
    });
  });

  describe('getComponentByKey', () => {
    it('returns ok result on success', async () => {
      const mockComponent = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        scheduleLine: '0001',
        reservationItem: '0001',
        recordType: 'M',
        material: 'MAT001',
      };
      mockCompGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockComponent),
      });

      const result = await service.getComponentByKey(
        '4500000001',
        '10',
        '0001',
        '0001',
        'M',
      );

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockComponent);
      expect(mockCompGetByKey).toHaveBeenCalledWith(
        '4500000001',
        '10',
        '0001',
        '0001',
        'M',
      );
    });
  });

  describe('deleteComponent', () => {
    it('calls delete with correct keys', async () => {
      mockCompDelete.mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      });

      const result = await service.deleteComponent(
        '4500000001',
        '10',
        '0001',
        '0001',
        'M',
      );

      expect(result.success).toBe(true);
      expect(mockCompDelete).toHaveBeenCalledWith(
        '4500000001',
        '10',
        '0001',
        '0001',
        'M',
      );
    });
  });
});
