import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  CreatePONoteInput,
  UpdatePONoteInput,
  CreatePOItemNoteInput,
  UpdatePOItemNoteInput,
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

const mockPurchaseOrderNoteApi = {
  requestBuilder: () => mockRequestBuilder,
  entityBuilder: () => ({
    purchaseOrder: vi.fn().mockReturnThis(),
    textObjectType: vi.fn().mockReturnThis(),
    language: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({}),
  }),
  schema: {
    PURCHASE_ORDER: { equals: vi.fn() },
    TEXT_OBJECT_TYPE: { equals: vi.fn() },
    LANGUAGE: { equals: vi.fn() },
    PLAIN_LONG_TEXT: {},
  },
};

const mockItemGetByKey = vi.fn();
const mockItemGetAll = vi.fn();
const mockItemCreate = vi.fn();
const mockItemUpdate = vi.fn();
const mockItemDelete = vi.fn();

const mockItemRequestBuilder = {
  getByKey: mockItemGetByKey,
  getAll: mockItemGetAll,
  create: mockItemCreate,
  update: mockItemUpdate,
  delete: mockItemDelete,
};

const mockPurchaseOrderItemNoteApi = {
  requestBuilder: () => mockItemRequestBuilder,
  entityBuilder: () => ({
    purchaseOrder: vi.fn().mockReturnThis(),
    purchaseOrderItem: vi.fn().mockReturnThis(),
    textObjectType: vi.fn().mockReturnThis(),
    language: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({}),
  }),
  schema: {
    PURCHASE_ORDER: { equals: vi.fn() },
    PURCHASE_ORDER_ITEM: { equals: vi.fn() },
    TEXT_OBJECT_TYPE: { equals: vi.fn() },
    LANGUAGE: { equals: vi.fn() },
    PLAIN_LONG_TEXT: {},
  },
};

vi.mock('../../generated/purchase-order-service/service.js', () => ({
  purchaseOrderService: () => ({
    purchaseOrderNoteApi: mockPurchaseOrderNoteApi,
    purchaseOrderItemNoteApi: mockPurchaseOrderItemNoteApi,
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
const { PurchaseOrderNoteService } =
  await import('./PurchaseOrderNoteService.js');

describe('PurchaseOrderNoteService', () => {
  let service: InstanceType<typeof PurchaseOrderNoteService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PurchaseOrderNoteService();
  });

  // ── PO Header Notes ──────────────────────────────────────────────

  describe('getNotes', () => {
    it('returns ok result with notes filtered by PO', async () => {
      const mockNotes = [
        {
          purchaseOrder: '4500000001',
          textObjectType: 'F01',
          language: 'EN',
          plainLongText: 'Note 1',
        },
        {
          purchaseOrder: '4500000001',
          textObjectType: 'F02',
          language: 'EN',
          plainLongText: 'Note 2',
        },
      ];
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockNotes),
      });
      mockGetAll.mockReturnValue({ filter: filterMock });

      const result = await service.getNotes('4500000001');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toHaveLength(2);
      expect(
        mockPurchaseOrderNoteApi.schema.PURCHASE_ORDER.equals,
      ).toHaveBeenCalledWith('4500000001');
    });

    it('returns fail result on SAP error', async () => {
      const sapError = new Error('Service unavailable');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 500,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Internal server error' },
          },
        },
      };
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });
      mockGetAll.mockReturnValue({ filter: filterMock });

      const result = await service.getNotes('4500000001');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
    });
  });

  describe('getNoteByKey', () => {
    it('returns ok result on success', async () => {
      const mockNote = {
        purchaseOrder: '4500000001',
        textObjectType: 'F01',
        language: 'EN',
        plainLongText: 'Header note text',
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockNote),
      });

      const result = await service.getNoteByKey('4500000001', 'F01', 'EN');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockNote);
      expect(mockGetByKey).toHaveBeenCalledWith('4500000001', 'F01', 'EN');
    });

    it('returns fail result on SAP error', async () => {
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Note not found' },
          },
        },
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });

      const result = await service.getNoteByKey('9999999999', 'F01', 'EN');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('SY/530');
    });
  });

  describe('createNote', () => {
    it('creates a note successfully', async () => {
      const mockCreated = {
        purchaseOrder: '4500000001',
        textObjectType: 'F01',
        language: 'EN',
        plainLongText: 'New note text',
      };
      mockCreate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockCreated),
      });

      const input: CreatePONoteInput = {
        textObjectType: 'F01',
        language: 'EN',
        plainLongText: 'New note text',
      };

      const result = await service.createNote('4500000001', input);

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockCreated);
      expect(mockCreate).toHaveBeenCalled();
    });

    it('returns fail result on SAP validation error', async () => {
      const sapError = new Error('Validation failed');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 400,
        data: {
          error: {
            code: 'BAPI/001',
            message: { value: 'Invalid text object type' },
          },
        },
      };
      mockCreate.mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });

      const input: CreatePONoteInput = {
        textObjectType: 'XXXX',
        language: 'EN',
        plainLongText: 'Bad note',
      };

      const result = await service.createNote('4500000001', input);

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
    });
  });

  describe('updateNote', () => {
    it('reads entity first then updates', async () => {
      const existingNote = {
        purchaseOrder: '4500000001',
        textObjectType: 'F01',
        language: 'EN',
        plainLongText: 'Old text',
      };
      mockGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingNote),
      });
      mockUpdate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingNote),
      });

      const input: UpdatePONoteInput = { plainLongText: 'Updated text' };
      const result = await service.updateNote('4500000001', 'F01', 'EN', input);

      expect(result.success).toBe(true);
      expect(mockGetByKey).toHaveBeenCalledWith('4500000001', 'F01', 'EN');
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    it('calls delete with all keys', async () => {
      mockDelete.mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      });

      const result = await service.deleteNote('4500000001', 'F01', 'EN');

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('4500000001', 'F01', 'EN');
    });
  });

  // ── PO Item Notes ────────────────────────────────────────────────

  describe('getItemNotes', () => {
    it('returns ok result with notes filtered by PO and item', async () => {
      const mockNotes = [
        {
          purchaseOrder: '4500000001',
          purchaseOrderItem: '10',
          textObjectType: 'F01',
          language: 'EN',
          plainLongText: 'Item note',
        },
      ];
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockNotes),
      });
      mockItemGetAll.mockReturnValue({ filter: filterMock });

      const result = await service.getItemNotes('4500000001', '10');

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toHaveLength(1);
      expect(
        mockPurchaseOrderItemNoteApi.schema.PURCHASE_ORDER.equals,
      ).toHaveBeenCalledWith('4500000001');
      expect(
        mockPurchaseOrderItemNoteApi.schema.PURCHASE_ORDER_ITEM.equals,
      ).toHaveBeenCalledWith('10');
    });

    it('returns fail result on SAP error', async () => {
      const sapError = new Error('Service unavailable');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 500,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Internal server error' },
          },
        },
      };
      const filterMock = vi.fn().mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });
      mockItemGetAll.mockReturnValue({ filter: filterMock });

      const result = await service.getItemNotes('4500000001', '10');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
    });
  });

  describe('getItemNoteByKey', () => {
    it('returns ok result on success', async () => {
      const mockNote = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        textObjectType: 'F01',
        language: 'EN',
        plainLongText: 'Item note text',
      };
      mockItemGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockNote),
      });

      const result = await service.getItemNoteByKey(
        '4500000001',
        '10',
        'F01',
        'EN',
      );

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockNote);
      expect(mockItemGetByKey).toHaveBeenCalledWith(
        '4500000001',
        '10',
        'F01',
        'EN',
      );
    });

    it('returns fail result on SAP error', async () => {
      const sapError = new Error('Not found');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 404,
        data: {
          error: {
            code: 'SY/530',
            message: { value: 'Item note not found' },
          },
        },
      };
      mockItemGetByKey.mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });

      const result = await service.getItemNoteByKey(
        '9999999999',
        '10',
        'F01',
        'EN',
      );

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('SY/530');
    });
  });

  describe('createItemNote', () => {
    it('creates an item note successfully', async () => {
      const mockCreated = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        textObjectType: 'F01',
        language: 'EN',
        plainLongText: 'New item note',
      };
      mockItemCreate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockCreated),
      });

      const input: CreatePOItemNoteInput = {
        textObjectType: 'F01',
        language: 'EN',
        plainLongText: 'New item note',
      };

      const result = await service.createItemNote('4500000001', '10', input);

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockCreated);
      expect(mockItemCreate).toHaveBeenCalled();
    });

    it('returns fail result on SAP validation error', async () => {
      const sapError = new Error('Validation failed');
      (sapError as unknown as Record<string, unknown>).response = {
        status: 400,
        data: {
          error: {
            code: 'BAPI/001',
            message: { value: 'Invalid text object type' },
          },
        },
      };
      mockItemCreate.mockReturnValue({
        execute: vi.fn().mockRejectedValue(sapError),
      });

      const input: CreatePOItemNoteInput = {
        textObjectType: 'XXXX',
        language: 'EN',
        plainLongText: 'Bad item note',
      };

      const result = await service.createItemNote('4500000001', '10', input);

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toBeDefined();
    });
  });

  describe('updateItemNote', () => {
    it('reads entity first then updates', async () => {
      const existingNote = {
        purchaseOrder: '4500000001',
        purchaseOrderItem: '10',
        textObjectType: 'F01',
        language: 'EN',
        plainLongText: 'Old item text',
      };
      mockItemGetByKey.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingNote),
      });
      mockItemUpdate.mockReturnValue({
        execute: vi.fn().mockResolvedValue(existingNote),
      });

      const input: UpdatePOItemNoteInput = {
        plainLongText: 'Updated item text',
      };
      const result = await service.updateItemNote(
        '4500000001',
        '10',
        'F01',
        'EN',
        input,
      );

      expect(result.success).toBe(true);
      expect(mockItemGetByKey).toHaveBeenCalledWith(
        '4500000001',
        '10',
        'F01',
        'EN',
      );
      expect(mockItemUpdate).toHaveBeenCalled();
    });
  });

  describe('deleteItemNote', () => {
    it('calls delete with all keys', async () => {
      mockItemDelete.mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      });

      const result = await service.deleteItemNote(
        '4500000001',
        '10',
        'F01',
        'EN',
      );

      expect(result.success).toBe(true);
      expect(mockItemDelete).toHaveBeenCalledWith(
        '4500000001',
        '10',
        'F01',
        'EN',
      );
    });
  });
});
