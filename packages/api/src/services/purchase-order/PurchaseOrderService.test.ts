import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  CreatePurchaseOrderInput,
  UpdatePOHeaderInput,
  UpdatePOItemInput,
  PurchaseOrderFilters,
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

const mockPurchaseOrderApi = {
  requestBuilder: () => mockRequestBuilder,
  entityBuilder: () => ({
    companyCode: vi.fn().mockReturnThis(),
    purchaseOrderType: vi.fn().mockReturnThis(),
    supplier: vi.fn().mockReturnThis(),
    purchasingOrganization: vi.fn().mockReturnThis(),
    purchasingGroup: vi.fn().mockReturnThis(),
    documentCurrency: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({ toPurchaseOrderItem: [] }),
  }),
  schema: {
    PURCHASE_ORDER: { equals: vi.fn() },
    COMPANY_CODE: { equals: vi.fn() },
    PURCHASE_ORDER_TYPE: { equals: vi.fn() },
    SUPPLIER: { equals: vi.fn() },
    PURCHASING_ORGANIZATION: { equals: vi.fn() },
    PURCHASING_GROUP: { equals: vi.fn() },
    PURCHASE_ORDER_DATE: {},
    DOCUMENT_CURRENCY: {},
    PAYMENT_TERMS: {},
    INCOTERMS_CLASSIFICATION: {},
    INCOTERMS_LOCATION_1: {},
    CREATED_BY_USER: {},
    CREATION_DATE: {},
    LAST_CHANGE_DATE_TIME: {},
    PURCHASING_DOCUMENT_DELETION_CODE: {},
    RELEASE_IS_NOT_COMPLETED: {},
    PURCHASING_COMPLETENESS_STATUS: {},
    TO_PURCHASE_ORDER_ITEM: { select: vi.fn().mockReturnThis() },
  },
};

const mockPurchaseOrderItemApi = {
  requestBuilder: () => mockRequestBuilder,
  entityBuilder: () => ({
    purchaseOrder: vi.fn().mockReturnThis(),
    purchaseOrderItem: vi.fn().mockReturnThis(),
    material: vi.fn().mockReturnThis(),
    orderQuantity: vi.fn().mockReturnThis(),
    purchaseOrderQuantityUnit: vi.fn().mockReturnThis(),
    plant: vi.fn().mockReturnThis(),
    netPriceAmount: vi.fn().mockReturnThis(),
    netPriceQuantity: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({}),
  }),
  schema: {
    PURCHASE_ORDER: { equals: vi.fn() },
    PURCHASE_ORDER_ITEM: {},
    PURCHASE_ORDER_ITEM_TEXT: {},
    MATERIAL: {},
    ORDER_QUANTITY: {},
    PURCHASE_ORDER_QUANTITY_UNIT: {},
    NET_PRICE_AMOUNT: {},
    DOCUMENT_CURRENCY: {},
    PLANT: {},
    PURCHASING_DOCUMENT_DELETION_CODE: {},
    IS_COMPLETELY_DELIVERED: {},
    IS_FINALLY_INVOICED: {},
    TO_SCHEDULE_LINE: {},
  },
};

vi.mock('../../generated/purchase-order-service/service.js', () => ({
  purchaseOrderService: () => ({
    purchaseOrderApi: mockPurchaseOrderApi,
    purchaseOrderItemApi: mockPurchaseOrderItemApi,
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
const { PurchaseOrderService } = await import('./PurchaseOrderService.js');

describe('PurchaseOrderService', () => {
  let service: InstanceType<typeof PurchaseOrderService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PurchaseOrderService();
  });

  describe('getById', () => {
    it('returns ok result on success', async () => {
      const mockPO = { purchaseOrder: '4500000001', companyCode: '1710' };
      const selectMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockPO),
      });
      mockGetByKey.mockReturnValue({ select: selectMock });

      const result = await service.getById('4500000001');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockPO);
      expect(mockGetByKey).toHaveBeenCalledWith('4500000001');
    });

    it('returns fail result on SAP error', async () => {
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Purchase order not found' },
          },
        },
      };
      const selectMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });
      mockGetByKey.mockReturnValue({ select: selectMock });

      const result = await service.getById('9999999999');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('SY/530');
    });
  });

  describe('getAll', () => {
    it('returns list of POs with no filters', async () => {
      const mockPOs = [
        { purchaseOrder: '4500000001' },
        { purchaseOrder: '4500000002' },
      ];
      const selectMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockPOs),
      });
      mockGetAll.mockReturnValue({ select: selectMock });

      const result = await service.getAll();

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toHaveLength(2);
    });

    it('applies filters when provided', async () => {
      const mockPOs = [{ purchaseOrder: '4500000001' }];
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockPOs),
      });
      const topMock = vi.fn().mockReturnThis();
      const skipMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockReturnValue({
        top: topMock,
        skip: skipMock,
        filter: filterMock,
        execute: vi.fn().mockResolvedValue(mockPOs),
      });
      mockGetAll.mockReturnValue({ select: selectMock });

      const filters: PurchaseOrderFilters = {
        supplier: '17300001',
        top: 10,
        skip: 0,
      };

      // The method calls top/skip/filter on the builder
      mockPurchaseOrderApi.schema.SUPPLIER.equals.mockReturnValue(
        'supplier_filter',
      );

      const result = await service.getAll(filters);
      expect(result.success).toBe(true);
    });
  });

  describe('create', () => {
    it('calls create with deep insert entity', async () => {
      const mockCreated = {
        purchaseOrder: '4500000099',
        companyCode: '1710',
      };
      mockCreate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockCreated),
      });

      const input: CreatePurchaseOrderInput = {
        companyCode: '1710',
        orderType: 'NB',
        supplier: '17300001',
        purchasingOrg: '1710',
        purchasingGroup: '001',
        currency: 'USD',
        items: [
          {
            material: 'TG11',
            quantity: 100,
            unit: 'PC',
            plant: '1710',
            netPrice: 10,
            deliveryDate: '2026-03-15',
          },
        ],
      };

      const result = await service.create(input);

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockCreated);
      expect(mockCreate).toHaveBeenCalled();
    });

    it('returns fail on invalid deliveryDate', async () => {
      const input: CreatePurchaseOrderInput = {
        companyCode: '1710',
        orderType: 'NB',
        supplier: '17300001',
        purchasingOrg: '1710',
        purchasingGroup: '001',
        currency: 'USD',
        items: [
          {
            material: 'TG11',
            quantity: 100,
            unit: 'PC',
            plant: '1710',
            netPrice: 10,
            deliveryDate: 'not-a-date',
          },
        ],
      };

      const result = await service.create(input);

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toContain('Invalid deliveryDate');
    });
  });

  describe('getItems', () => {
    it('returns items filtered by PO id (no extra SAP call)', async () => {
      const mockItems = [
        { purchaseOrder: '4500000001', purchaseOrderItem: '10' },
        { purchaseOrder: '4500000001', purchaseOrderItem: '20' },
      ];
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockItems),
      });
      mockGetAll.mockReturnValue({ filter: filterMock });

      const result = await service.getItems('4500000001');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toHaveLength(2);
      // Non-empty result — PO check should NOT have been called
      expect(mockGetByKey).not.toHaveBeenCalled();
    });

    it('returns 404 when parent PO does not exist', async () => {
      // getAll returns empty array
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      });
      mockGetAll.mockReturnValue({ filter: filterMock });
      // PO existence check fails with 404
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: '/IWBEP/CM_MGW_RT/020',
            message: {
              value:
                "Resource not found for segment 'A_PurchaseOrderType'",
            },
          },
        },
      };
      const poSelectMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });
      mockGetByKey.mockReturnValue({ select: poSelectMock });

      const result = await service.getItems('4500005678');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.httpStatus).toBe(404);
      expect(result.error.code).toBe('/IWBEP/CM_MGW_RT/020');
    });
  });

  describe('getItem', () => {
    it('returns a single item by key', async () => {
      const mockItem = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        material: 'TG11',
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockItem),
      });

      const result = await service.getItem('4500000001', '10');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockItem);
      expect(mockGetByKey).toHaveBeenCalledWith('4500000001', '10');
    });

    it('returns fail result when item not found', async () => {
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Item not found' },
          },
        },
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });

      const result = await service.getItem('4500000001', '99');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
    });
  });

  describe('updateHeader', () => {
    it('reads entity first then updates', async () => {
      const existingPO = {
        purchaseOrder: '4500000001',
        supplier: '17300001',
        paymentTerms: '0001',
      };
      const selectMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingPO),
      });
      mockGetByKey.mockReturnValue({
        select: selectMock,
        execute: vi.fn().mockResolvedValue(existingPO),
      });
      mockUpdate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingPO),
      });

      const changes: UpdatePOHeaderInput = { paymentTerms: '0002' };
      const result = await service.updateHeader('4500000001', changes);

      expect(result.success).toBe(true);
    });
  });

  describe('delete', () => {
    it('calls delete on the API', async () => {
      mockDelete.mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      });

      const result = await service.delete('4500000001');

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('4500000001');
    });
  });

  describe('deleteItem', () => {
    it('calls delete with PO and item keys', async () => {
      mockDelete.mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      });

      const result = await service.deleteItem('4500000001', '10');

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('4500000001', '10');
    });
  });

  describe('updateItem', () => {
    it('reads item first then updates with changed fields', async () => {
      const existingItem = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        orderQuantity: 100,
        netPriceAmount: 10,
        plant: '1710',
        purchaseOrderItemText: 'Original text',
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingItem),
      });
      mockUpdate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingItem),
      });

      const changes: UpdatePOItemInput = {
        quantity: 200,
        description: 'Updated text',
      };
      const result = await service.updateItem('4500000001', '10', changes);

      expect(result.success).toBe(true);
      expect(mockGetByKey).toHaveBeenCalledWith('4500000001', '10');
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('addItem', () => {
    it('creates item on existing PO', async () => {
      const mockItem = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '20',
      };
      mockCreate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockItem),
      });

      const result = await service.addItem('4500000001', {
        itemNumber: '20',
        material: 'TG11',
        quantity: 50,
        unit: 'PC',
        plant: '1710',
        netPrice: 15,
        deliveryDate: '2026-04-01',
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockItem);
    });
  });
});
