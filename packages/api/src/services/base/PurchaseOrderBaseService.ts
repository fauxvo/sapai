import { BaseService } from './BaseService.js';
import type { ServiceResult } from './types.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Shared base for all PO-related services. Provides lazy
 * ancestor-existence checks used by list methods that rely on
 * getAll().filter() (which silently returns [] for non-existent
 * parent entities instead of a 404).
 */
export abstract class PurchaseOrderBaseService extends BaseService {
  /**
   * Returns a failed ServiceResult if the PO doesn't exist, or null if it does.
   * Uses a lightweight getByKey with minimal select.
   */
  protected async verifyPoExists<T>(
    poId: string,
    purchaseOrderApi: any,
  ): Promise<ServiceResult<T> | null> {
    const check = await this.execute(() =>
      purchaseOrderApi
        .requestBuilder()
        .getByKey(poId)
        .select(purchaseOrderApi.schema.PURCHASE_ORDER)
        .execute(this.destination),
    );
    return check.success ? null : (check as ServiceResult<T>);
  }

  /**
   * Returns a failed ServiceResult if the PO or item doesn't exist, or
   * null if both do. Checks PO first for clearer error messages.
   */
  protected async verifyPoItemExists<T>(
    poId: string,
    itemId: string,
    purchaseOrderApi: any,
    purchaseOrderItemApi: any,
  ): Promise<ServiceResult<T> | null> {
    const poError = await this.verifyPoExists<T>(poId, purchaseOrderApi);
    if (poError) return poError;

    const check = await this.execute(() =>
      purchaseOrderItemApi
        .requestBuilder()
        .getByKey(poId, itemId)
        .select(
          purchaseOrderItemApi.schema.PURCHASE_ORDER,
          purchaseOrderItemApi.schema.PURCHASE_ORDER_ITEM,
        )
        .execute(this.destination),
    );
    return check.success ? null : (check as ServiceResult<T>);
  }
}
