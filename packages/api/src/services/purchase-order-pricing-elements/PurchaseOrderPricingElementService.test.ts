import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UpdatePricingElementInput } from './types.js';

// Mock the generated service before importing
const mockGetByKey = vi.fn();
const mockGetAll = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const mockRequestBuilder = {
  getByKey: mockGetByKey,
  getAll: mockGetAll,
  update: mockUpdate,
  delete: mockDelete,
};

const mockPurOrdPricingElementApi = {
  requestBuilder: () => mockRequestBuilder,
  schema: {
    PURCHASE_ORDER: { equals: vi.fn() },
    PURCHASE_ORDER_ITEM: { equals: vi.fn() },
  },
};

vi.mock('../../generated/purchase-order-service/service.js', () => ({
  purchaseOrderService: () => ({
    purOrdPricingElementApi: mockPurOrdPricingElementApi,
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
const { PurchaseOrderPricingElementService } =
  await import('./PurchaseOrderPricingElementService.js');

describe('PurchaseOrderPricingElementService', () => {
  let service: InstanceType<typeof PurchaseOrderPricingElementService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PurchaseOrderPricingElementService();
  });

  describe('getPricingElements', () => {
    it('returns ok result on success', async () => {
      const mockElements = [
        {
          purchaseOrder: '4500000001',
          purchaseOrderItem: '10',
          conditionType: 'PB00',
        },
      ];
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockElements),
      });
      mockGetAll.mockReturnValue({ filter: filterMock });

      mockPurOrdPricingElementApi.schema.PURCHASE_ORDER.equals.mockReturnValue(
        'po_filter',
      );
      mockPurOrdPricingElementApi.schema.PURCHASE_ORDER_ITEM.equals.mockReturnValue(
        'item_filter',
      );

      const result = await service.getPricingElements('4500000001', '10');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockElements);
    });
  });

  describe('getPricingElementByKey', () => {
    it('returns ok result on success', async () => {
      const mockElement = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        pricingDocument: '0000000001',
        pricingDocumentItem: '000010',
        pricingProcedureStep: '010',
        pricingProcedureCounter: '01',
        conditionType: 'PB00',
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockElement),
      });

      const result = await service.getPricingElementByKey(
        '4500000001',
        '10',
        '0000000001',
        '000010',
        '010',
        '01',
      );

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockElement);
      expect(mockGetByKey).toHaveBeenCalledWith(
        '4500000001',
        '10',
        '0000000001',
        '000010',
        '010',
        '01',
      );
    });

    it('returns fail result on SAP error', async () => {
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Pricing element not found' },
          },
        },
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });

      const result = await service.getPricingElementByKey(
        '4500000001',
        '10',
        '9999999999',
        '000010',
        '010',
        '01',
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('SY/530');
    });
  });

  describe('updatePricingElement', () => {
    it('reads entity first then updates', async () => {
      const existingElement = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        pricingDocument: '0000000001',
        pricingDocumentItem: '000010',
        pricingProcedureStep: '010',
        pricingProcedureCounter: '01',
        conditionRateValue: null,
        conditionCurrency: 'USD',
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingElement),
      });
      mockUpdate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingElement),
      });

      const changes: UpdatePricingElementInput = {
        conditionRateValue: 15.5,
        conditionCurrency: 'EUR',
      };
      const result = await service.updatePricingElement(
        '4500000001',
        '10',
        '0000000001',
        '000010',
        '010',
        '01',
        changes,
      );

      expect(result.success).toBe(true);
      expect(mockGetByKey).toHaveBeenCalledWith(
        '4500000001',
        '10',
        '0000000001',
        '000010',
        '010',
        '01',
      );
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('deletePricingElement', () => {
    it('calls delete with all keys', async () => {
      mockDelete.mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      });

      const result = await service.deletePricingElement(
        '4500000001',
        '10',
        '0000000001',
        '000010',
        '010',
        '01',
      );

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith(
        '4500000001',
        '10',
        '0000000001',
        '000010',
        '010',
        '01',
      );
    });
  });
});
