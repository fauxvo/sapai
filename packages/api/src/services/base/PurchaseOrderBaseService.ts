import { BaseService } from './BaseService.js';
import type { ServiceResult } from './types.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Shared base for all PO-related services. Provides lazy
 * ancestor-existence checks used by list methods that rely on
 * getAll().filter() (which silently returns [] for non-existent
 * parent entities instead of a 404).
 *
 * Only 404 errors from existence checks are propagated. Other failures
 * (network errors, 503s, etc.) are ignored — a successful empty list
 * is more useful than an infrastructure error from a speculative check.
 */
export abstract class PurchaseOrderBaseService extends BaseService {
  /**
   * Returns a 404 ServiceResult if the PO doesn't exist, or null
   * if it does (or if the check fails with a non-404 error).
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
    if (!check.success && check.error.httpStatus === 404) {
      return check as ServiceResult<T>;
    }
    return null;
  }

  /**
   * Returns a 404 ServiceResult if the PO or item doesn't exist, or
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
    if (!check.success && check.error.httpStatus === 404) {
      return check as ServiceResult<T>;
    }
    return null;
  }

  /**
   * Returns a 404 ServiceResult if the PO, item, or schedule line
   * doesn't exist, or null if all do. Checks each level in order
   * for clearer error messages.
   */
  protected async verifyScheduleLineExists<T>(
    poId: string,
    itemId: string,
    lineId: string,
    purchaseOrderApi: any,
    purchaseOrderItemApi: any,
    purchaseOrderScheduleLineApi: any,
  ): Promise<ServiceResult<T> | null> {
    const itemError = await this.verifyPoItemExists<T>(
      poId,
      itemId,
      purchaseOrderApi,
      purchaseOrderItemApi,
    );
    if (itemError) return itemError;

    const check = await this.execute(() =>
      purchaseOrderScheduleLineApi
        .requestBuilder()
        .getByKey(poId, itemId, lineId)
        .execute(this.destination),
    );
    if (!check.success && check.error.httpStatus === 404) {
      return check as ServiceResult<T>;
    }
    return null;
  }
}
