import { BigNumber } from 'bignumber.js';
// moment is required by SAP Cloud SDK generated entity types for Edm.DateTime fields
import moment from 'moment';
import { purchaseOrderService } from '../../generated/purchase-order-service/service.js';
import type { PurchaseOrderScheduleLine } from '../../generated/purchase-order-service/PurchaseOrderScheduleLine.js';
import type { PoSubcontractingComponent } from '../../generated/purchase-order-service/PoSubcontractingComponent.js';
import { PurchaseOrderBaseService } from '../base/PurchaseOrderBaseService.js';
import type { ServiceResult } from '../base/types.js';
import type {
  CreateScheduleLineInput,
  UpdateScheduleLineInput,
  UpdateSubcontractingComponentInput,
} from './types.js';

export class PurchaseOrderScheduleLineService extends PurchaseOrderBaseService {
  private readonly svc = purchaseOrderService();

  // ---------------------------------------------------------------------------
  // Schedule Lines
  // ---------------------------------------------------------------------------

  async getScheduleLines(
    poId: string,
    itemId: string,
  ): Promise<ServiceResult<PurchaseOrderScheduleLine[]>> {
    const result = await this.execute(() => {
      const { purchaseOrderScheduleLineApi } = this.svc;
      const { schema } = purchaseOrderScheduleLineApi;
      return purchaseOrderScheduleLineApi
        .requestBuilder()
        .getAll()
        .filter(
          schema.PURCHASING_DOCUMENT.equals(poId),
          schema.PURCHASING_DOCUMENT_ITEM.equals(itemId),
        )
        .execute(this.destination);
    });

    // Disambiguate: empty because no schedule lines, or PO/item doesn't exist?
    if (result.success && result.data.length === 0) {
      const error =
        await this.verifyPoItemExists<PurchaseOrderScheduleLine[]>(
          poId,
          itemId,
          this.svc.purchaseOrderApi,
          this.svc.purchaseOrderItemApi,
        );
      if (error) return error;
    }

    return result;
  }

  async getScheduleLineByKey(
    poId: string,
    itemId: string,
    lineId: string,
  ): Promise<ServiceResult<PurchaseOrderScheduleLine>> {
    return this.execute(() => {
      const { purchaseOrderScheduleLineApi } = this.svc;
      return purchaseOrderScheduleLineApi
        .requestBuilder()
        .getByKey(poId, itemId, lineId)
        .execute(this.destination);
    });
  }

  async createScheduleLine(
    poId: string,
    itemId: string,
    input: CreateScheduleLineInput,
  ): Promise<ServiceResult<PurchaseOrderScheduleLine>> {
    return this.execute(() => {
      const { purchaseOrderScheduleLineApi } = this.svc;

      const entity = purchaseOrderScheduleLineApi
        .entityBuilder()
        .purchasingDocument(poId)
        .purchasingDocumentItem(itemId)
        .build();

      if (input.scheduleLine) entity.scheduleLine = input.scheduleLine;
      if (input.delivDateCategory)
        entity.delivDateCategory = input.delivDateCategory;
      if (input.scheduleLineDeliveryDate)
        entity.scheduleLineDeliveryDate = moment(
          input.scheduleLineDeliveryDate,
        );
      if (input.purchaseOrderQuantityUnit)
        entity.purchaseOrderQuantityUnit = input.purchaseOrderQuantityUnit;
      if (input.scheduleLineOrderQuantity !== undefined)
        entity.scheduleLineOrderQuantity = new BigNumber(
          input.scheduleLineOrderQuantity,
        );
      if (input.scheduleLineDeliveryTime) {
        const [hours, minutes, seconds] = input.scheduleLineDeliveryTime
          .split(':')
          .map(Number);
        entity.scheduleLineDeliveryTime = {
          hours: hours || 0,
          minutes: minutes || 0,
          seconds: seconds || 0,
        };
      }
      if (input.performancePeriodStartDate)
        entity.performancePeriodStartDate = moment(
          input.performancePeriodStartDate,
        );
      if (input.performancePeriodEndDate)
        entity.performancePeriodEndDate = moment(
          input.performancePeriodEndDate,
        );

      return purchaseOrderScheduleLineApi
        .requestBuilder()
        .create(entity)
        .execute(this.destination);
    });
  }

  async updateScheduleLine(
    poId: string,
    itemId: string,
    lineId: string,
    input: UpdateScheduleLineInput,
  ): Promise<ServiceResult<PurchaseOrderScheduleLine>> {
    return this.execute(async () => {
      const { purchaseOrderScheduleLineApi } = this.svc;

      const existing = await purchaseOrderScheduleLineApi
        .requestBuilder()
        .getByKey(poId, itemId, lineId)
        .execute(this.destination);

      if (input.delivDateCategory !== undefined)
        existing.delivDateCategory = input.delivDateCategory;
      if (input.scheduleLineDeliveryDate !== undefined)
        existing.scheduleLineDeliveryDate = moment(
          input.scheduleLineDeliveryDate,
        );
      if (input.scheduleLineOrderQuantity !== undefined)
        existing.scheduleLineOrderQuantity = new BigNumber(
          input.scheduleLineOrderQuantity,
        );
      if (input.scheduleLineDeliveryTime !== undefined) {
        const [hours, minutes, seconds] = input.scheduleLineDeliveryTime
          .split(':')
          .map(Number);
        existing.scheduleLineDeliveryTime = {
          hours: hours || 0,
          minutes: minutes || 0,
          seconds: seconds || 0,
        };
      }
      if (input.schedLineStscDeliveryDate !== undefined)
        existing.schedLineStscDeliveryDate = moment(
          input.schedLineStscDeliveryDate,
        );
      if (input.performancePeriodStartDate !== undefined)
        existing.performancePeriodStartDate = moment(
          input.performancePeriodStartDate,
        );
      if (input.performancePeriodEndDate !== undefined)
        existing.performancePeriodEndDate = moment(
          input.performancePeriodEndDate,
        );

      return purchaseOrderScheduleLineApi
        .requestBuilder()
        .update(existing)
        .execute(this.destination);
    });
  }

  async deleteScheduleLine(
    poId: string,
    itemId: string,
    lineId: string,
  ): Promise<ServiceResult<void>> {
    return this.execute(() => {
      const { purchaseOrderScheduleLineApi } = this.svc;
      return purchaseOrderScheduleLineApi
        .requestBuilder()
        .delete(poId, itemId, lineId)
        .execute(this.destination);
    });
  }

  // ---------------------------------------------------------------------------
  // Subcontracting Components (read / update / delete only)
  // ---------------------------------------------------------------------------

  async getComponents(
    poId: string,
    itemId: string,
    lineId: string,
  ): Promise<ServiceResult<PoSubcontractingComponent[]>> {
    const result = await this.execute(() => {
      const { poSubcontractingComponentApi } = this.svc;
      const { schema } = poSubcontractingComponentApi;
      return poSubcontractingComponentApi
        .requestBuilder()
        .getAll()
        .filter(
          schema.PURCHASE_ORDER.equals(poId),
          schema.PURCHASE_ORDER_ITEM.equals(itemId),
          schema.SCHEDULE_LINE.equals(lineId),
        )
        .execute(this.destination);
    });

    // Disambiguate: empty because no components, or PO/item doesn't exist?
    if (result.success && result.data.length === 0) {
      const error =
        await this.verifyPoItemExists<PoSubcontractingComponent[]>(
          poId,
          itemId,
          this.svc.purchaseOrderApi,
          this.svc.purchaseOrderItemApi,
        );
      if (error) return error;
    }

    return result;
  }

  async getComponentByKey(
    poId: string,
    itemId: string,
    lineId: string,
    reservationItem: string,
    recordType: string,
  ): Promise<ServiceResult<PoSubcontractingComponent>> {
    return this.execute(() => {
      const { poSubcontractingComponentApi } = this.svc;
      return poSubcontractingComponentApi
        .requestBuilder()
        .getByKey(poId, itemId, lineId, reservationItem, recordType)
        .execute(this.destination);
    });
  }

  async updateComponent(
    poId: string,
    itemId: string,
    lineId: string,
    reservationItem: string,
    recordType: string,
    input: UpdateSubcontractingComponentInput,
  ): Promise<ServiceResult<PoSubcontractingComponent>> {
    return this.execute(async () => {
      const { poSubcontractingComponentApi } = this.svc;

      const existing = await poSubcontractingComponentApi
        .requestBuilder()
        .getByKey(poId, itemId, lineId, reservationItem, recordType)
        .execute(this.destination);

      if (input.requiredQuantity !== undefined)
        existing.requiredQuantity = new BigNumber(input.requiredQuantity);
      if (input.quantityInEntryUnit !== undefined)
        existing.quantityInEntryUnit = new BigNumber(input.quantityInEntryUnit);
      if (input.requirementDate !== undefined)
        existing.requirementDate = moment(input.requirementDate);
      if (input.plant !== undefined) existing.plant = input.plant;
      if (input.batch !== undefined) existing.batch = input.batch;

      return poSubcontractingComponentApi
        .requestBuilder()
        .update(existing)
        .execute(this.destination);
    });
  }

  async deleteComponent(
    poId: string,
    itemId: string,
    lineId: string,
    reservationItem: string,
    recordType: string,
  ): Promise<ServiceResult<void>> {
    return this.execute(() => {
      const { poSubcontractingComponentApi } = this.svc;
      return poSubcontractingComponentApi
        .requestBuilder()
        .delete(poId, itemId, lineId, reservationItem, recordType)
        .execute(this.destination);
    });
  }
}
