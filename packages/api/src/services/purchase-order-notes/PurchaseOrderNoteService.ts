import { purchaseOrderService } from '../../generated/purchase-order-service/service.js';
import type { PurchaseOrderNote } from '../../generated/purchase-order-service/PurchaseOrderNote.js';
import type { PurchaseOrderItemNote } from '../../generated/purchase-order-service/PurchaseOrderItemNote.js';
import { PurchaseOrderBaseService } from '../base/PurchaseOrderBaseService.js';
import type { ServiceResult } from '../base/types.js';
import type {
  CreatePONoteInput,
  UpdatePONoteInput,
  CreatePOItemNoteInput,
  UpdatePOItemNoteInput,
} from './types.js';

export class PurchaseOrderNoteService extends PurchaseOrderBaseService {
  private readonly svc = purchaseOrderService();

  // ── PO Header Notes ──────────────────────────────────────────────

  async getNotes(poId: string): Promise<ServiceResult<PurchaseOrderNote[]>> {
    const result = await this.execute(() => {
      const { purchaseOrderNoteApi } = this.svc;
      return purchaseOrderNoteApi
        .requestBuilder()
        .getAll()
        .filter(purchaseOrderNoteApi.schema.PURCHASE_ORDER.equals(poId))
        .execute(this.destination);
    });

    // Disambiguate: empty because PO has no notes, or PO doesn't exist?
    if (result.success && result.data.length === 0) {
      const error = await this.verifyPoExists<PurchaseOrderNote[]>(
        poId,
        this.svc.purchaseOrderApi,
      );
      if (error) return error;
    }

    return result;
  }

  async getNoteByKey(
    poId: string,
    textObjectType: string,
    language: string,
  ): Promise<ServiceResult<PurchaseOrderNote>> {
    return this.execute(() => {
      const { purchaseOrderNoteApi } = this.svc;
      return purchaseOrderNoteApi
        .requestBuilder()
        .getByKey(poId, textObjectType, language)
        .execute(this.destination);
    });
  }

  async createNote(
    poId: string,
    input: CreatePONoteInput,
  ): Promise<ServiceResult<PurchaseOrderNote>> {
    return this.execute(() => {
      const { purchaseOrderNoteApi } = this.svc;
      const entity = purchaseOrderNoteApi
        .entityBuilder()
        .purchaseOrder(poId)
        .textObjectType(input.textObjectType)
        .language(input.language)
        .build();

      entity.plainLongText = input.plainLongText;

      return purchaseOrderNoteApi
        .requestBuilder()
        .create(entity)
        .execute(this.destination);
    });
  }

  async updateNote(
    poId: string,
    textObjectType: string,
    language: string,
    input: UpdatePONoteInput,
  ): Promise<ServiceResult<PurchaseOrderNote>> {
    return this.execute(async () => {
      const { purchaseOrderNoteApi } = this.svc;

      // Read first to get ETag for optimistic locking
      const existing = await purchaseOrderNoteApi
        .requestBuilder()
        .getByKey(poId, textObjectType, language)
        .execute(this.destination);

      existing.plainLongText = input.plainLongText;

      return purchaseOrderNoteApi
        .requestBuilder()
        .update(existing)
        .execute(this.destination);
    });
  }

  async deleteNote(
    poId: string,
    textObjectType: string,
    language: string,
  ): Promise<ServiceResult<void>> {
    return this.execute(() => {
      const { purchaseOrderNoteApi } = this.svc;
      return purchaseOrderNoteApi
        .requestBuilder()
        .delete(poId, textObjectType, language)
        .execute(this.destination);
    });
  }

  // ── PO Item Notes ────────────────────────────────────────────────

  async getItemNotes(
    poId: string,
    itemId: string,
  ): Promise<ServiceResult<PurchaseOrderItemNote[]>> {
    const result = await this.execute(() => {
      const { purchaseOrderItemNoteApi } = this.svc;
      return purchaseOrderItemNoteApi
        .requestBuilder()
        .getAll()
        .filter(
          purchaseOrderItemNoteApi.schema.PURCHASE_ORDER.equals(poId),
          purchaseOrderItemNoteApi.schema.PURCHASE_ORDER_ITEM.equals(itemId),
        )
        .execute(this.destination);
    });

    // Disambiguate: empty because no item notes, or PO/item doesn't exist?
    if (result.success && result.data.length === 0) {
      const error =
        await this.verifyPoItemExists<PurchaseOrderItemNote[]>(
          poId,
          itemId,
          this.svc.purchaseOrderApi,
          this.svc.purchaseOrderItemApi,
        );
      if (error) return error;
    }

    return result;
  }

  async getItemNoteByKey(
    poId: string,
    itemId: string,
    textObjectType: string,
    language: string,
  ): Promise<ServiceResult<PurchaseOrderItemNote>> {
    return this.execute(() => {
      const { purchaseOrderItemNoteApi } = this.svc;
      return purchaseOrderItemNoteApi
        .requestBuilder()
        .getByKey(poId, itemId, textObjectType, language)
        .execute(this.destination);
    });
  }

  async createItemNote(
    poId: string,
    itemId: string,
    input: CreatePOItemNoteInput,
  ): Promise<ServiceResult<PurchaseOrderItemNote>> {
    return this.execute(() => {
      const { purchaseOrderItemNoteApi } = this.svc;
      const entity = purchaseOrderItemNoteApi
        .entityBuilder()
        .purchaseOrder(poId)
        .purchaseOrderItem(itemId)
        .textObjectType(input.textObjectType)
        .language(input.language)
        .build();

      entity.plainLongText = input.plainLongText;

      return purchaseOrderItemNoteApi
        .requestBuilder()
        .create(entity)
        .execute(this.destination);
    });
  }

  async updateItemNote(
    poId: string,
    itemId: string,
    textObjectType: string,
    language: string,
    input: UpdatePOItemNoteInput,
  ): Promise<ServiceResult<PurchaseOrderItemNote>> {
    return this.execute(async () => {
      const { purchaseOrderItemNoteApi } = this.svc;

      // Read first to get ETag for optimistic locking
      const existing = await purchaseOrderItemNoteApi
        .requestBuilder()
        .getByKey(poId, itemId, textObjectType, language)
        .execute(this.destination);

      existing.plainLongText = input.plainLongText;

      return purchaseOrderItemNoteApi
        .requestBuilder()
        .update(existing)
        .execute(this.destination);
    });
  }

  async deleteItemNote(
    poId: string,
    itemId: string,
    textObjectType: string,
    language: string,
  ): Promise<ServiceResult<void>> {
    return this.execute(() => {
      const { purchaseOrderItemNoteApi } = this.svc;
      return purchaseOrderItemNoteApi
        .requestBuilder()
        .delete(poId, itemId, textObjectType, language)
        .execute(this.destination);
    });
  }
}
