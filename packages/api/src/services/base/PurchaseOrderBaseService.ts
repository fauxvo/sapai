import { BaseService } from './BaseService.js';
import type { ServiceResult } from './types.js';
import { createLogger } from '../../utils/logger.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

const logger = createLogger('PurchaseOrderBaseService');

/**
 * Shared base for all PO-related services. Provides lazy
 * ancestor-existence checks used by list methods that rely on
 * getAll().filter() (which silently returns [] for non-existent
 * parent entities instead of a 404).
 *
 * Only 404 errors from existence checks are propagated. Other failures
 * (network errors, 503s, etc.) are logged at WARN level but otherwise
 * ignored — returning a successful empty list is more useful than
 * surfacing an infrastructure error from a speculative check.
 *
 * **TOCTOU caveat**: These checks run *after* the primary query, so
 * there is a small window where a concurrent delete could cause the
 * existence check to return 404 even though the entity existed when
 * the original request arrived. This is inherent to the two-query
 * approach and is accepted as a low-probability edge case.
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
    if (!check.success) {
      if (check.error.httpStatus === 404) {
        return check as ServiceResult<T>;
      }
      logger.warn('Non-404 error during PO existence check (suppressed)', {
        poId,
        httpStatus: check.error.httpStatus,
        code: check.error.code,
      });
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
    if (!check.success) {
      if (check.error.httpStatus === 404) {
        return check as ServiceResult<T>;
      }
      logger.warn('Non-404 error during item existence check (suppressed)', {
        poId,
        itemId,
        httpStatus: check.error.httpStatus,
        code: check.error.code,
      });
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
        .select(
          purchaseOrderScheduleLineApi.schema.PURCHASING_DOCUMENT,
          purchaseOrderScheduleLineApi.schema.PURCHASING_DOCUMENT_ITEM,
          purchaseOrderScheduleLineApi.schema.SCHEDULE_LINE,
        )
        .execute(this.destination),
    );
    if (!check.success) {
      if (check.error.httpStatus === 404) {
        return check as ServiceResult<T>;
      }
      logger.warn(
        'Non-404 error during schedule line existence check (suppressed)',
        {
          poId,
          itemId,
          lineId,
          httpStatus: check.error.httpStatus,
          code: check.error.code,
        },
      );
    }
    return null;
  }
}
