import { BigNumber } from 'bignumber.js';
import { purchaseOrderService } from '../../generated/purchase-order-service/service.js';
import type { PurOrdPricingElement } from '../../generated/purchase-order-service/PurOrdPricingElement.js';
import { BaseService } from '../base/BaseService.js';
import type { ServiceResult } from '../base/types.js';
import type { UpdatePricingElementInput } from './types.js';

export class PurchaseOrderPricingElementService extends BaseService {
  // Safe as singleton: purchaseOrderService() returns stateless API accessors.
  // CSRF tokens and ETags are managed per-request by the SDK, not cached here.
  private readonly svc = purchaseOrderService();

  async getPricingElements(
    poId: string,
    itemId: string,
  ): Promise<ServiceResult<PurOrdPricingElement[]>> {
    // Verify parent PO exists first — getAll().filter() silently returns []
    // for non-existent POs instead of a 404 error.
    const { purchaseOrderApi } = this.svc;
    const poCheck = await this.execute(() =>
      purchaseOrderApi
        .requestBuilder()
        .getByKey(poId)
        .select(purchaseOrderApi.schema.PURCHASE_ORDER)
        .execute(this.destination),
    );
    if (!poCheck.success) {
      return poCheck as ServiceResult<PurOrdPricingElement[]>;
    }

    return this.execute(() => {
      const { purOrdPricingElementApi } = this.svc;
      const { schema } = purOrdPricingElementApi;
      return purOrdPricingElementApi
        .requestBuilder()
        .getAll()
        .filter(
          schema.PURCHASE_ORDER.equals(poId),
          schema.PURCHASE_ORDER_ITEM.equals(itemId),
        )
        .execute(this.destination);
    });
  }

  async getPricingElementByKey(
    poId: string,
    itemId: string,
    pricingDoc: string,
    pricingDocItem: string,
    step: string,
    counter: string,
  ): Promise<ServiceResult<PurOrdPricingElement>> {
    return this.execute(() => {
      const { purOrdPricingElementApi } = this.svc;
      return purOrdPricingElementApi
        .requestBuilder()
        .getByKey(poId, itemId, pricingDoc, pricingDocItem, step, counter)
        .execute(this.destination);
    });
  }

  async updatePricingElement(
    poId: string,
    itemId: string,
    pricingDoc: string,
    pricingDocItem: string,
    step: string,
    counter: string,
    input: UpdatePricingElementInput,
  ): Promise<ServiceResult<PurOrdPricingElement>> {
    return this.execute(async () => {
      const { purOrdPricingElementApi } = this.svc;

      const existing = await purOrdPricingElementApi
        .requestBuilder()
        .getByKey(poId, itemId, pricingDoc, pricingDocItem, step, counter)
        .execute(this.destination);

      if (input.conditionRateValue !== undefined)
        existing.conditionRateValue = new BigNumber(input.conditionRateValue);
      if (input.conditionCurrency !== undefined)
        existing.conditionCurrency = input.conditionCurrency;
      if (input.conditionQuantity !== undefined)
        existing.conditionQuantity = new BigNumber(input.conditionQuantity);
      if (input.conditionQuantityUnit !== undefined)
        existing.conditionQuantityUnit = input.conditionQuantityUnit;
      if (input.priceDetnExchangeRate !== undefined)
        existing.priceDetnExchangeRate = input.priceDetnExchangeRate;
      if (input.conditionIsManuallyChanged !== undefined)
        existing.conditionIsManuallyChanged = input.conditionIsManuallyChanged;

      return purOrdPricingElementApi
        .requestBuilder()
        .update(existing)
        .execute(this.destination);
    });
  }

  async deletePricingElement(
    poId: string,
    itemId: string,
    pricingDoc: string,
    pricingDocItem: string,
    step: string,
    counter: string,
  ): Promise<ServiceResult<void>> {
    return this.execute(() => {
      const { purOrdPricingElementApi } = this.svc;
      return purOrdPricingElementApi
        .requestBuilder()
        .delete(poId, itemId, pricingDoc, pricingDocItem, step, counter)
        .execute(this.destination);
    });
  }
}
