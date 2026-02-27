import { BigNumber } from 'bignumber.js';
import { purchaseOrderService } from '../../generated/purchase-order-service/service.js';
import type { PurchaseOrder } from '../../generated/purchase-order-service/PurchaseOrder.js';
import type { PurchaseOrderItem } from '../../generated/purchase-order-service/PurchaseOrderItem.js';
import { PurchaseOrderBaseService } from '../base/PurchaseOrderBaseService.js';
import type { ServiceResult } from '../base/types.js';
import type {
  CreatePurchaseOrderInput,
  AddPOItemInput,
  UpdatePOHeaderInput,
  UpdatePOItemInput,
  PurchaseOrderFilters,
} from './types.js';

export class PurchaseOrderService extends PurchaseOrderBaseService {
  private readonly svc = purchaseOrderService();

  async getById(
    purchaseOrderId: string,
  ): Promise<ServiceResult<PurchaseOrder>> {
    return this.execute(() => {
      const { purchaseOrderApi } = this.svc;
      return purchaseOrderApi
        .requestBuilder()
        .getByKey(purchaseOrderId)
        .select(
          purchaseOrderApi.schema.PURCHASE_ORDER,
          purchaseOrderApi.schema.COMPANY_CODE,
          purchaseOrderApi.schema.PURCHASE_ORDER_TYPE,
          purchaseOrderApi.schema.SUPPLIER,
          purchaseOrderApi.schema.PURCHASING_ORGANIZATION,
          purchaseOrderApi.schema.PURCHASING_GROUP,
          purchaseOrderApi.schema.PURCHASE_ORDER_DATE,
          purchaseOrderApi.schema.DOCUMENT_CURRENCY,
          purchaseOrderApi.schema.PAYMENT_TERMS,
          purchaseOrderApi.schema.INCOTERMS_CLASSIFICATION,
          purchaseOrderApi.schema.INCOTERMS_LOCATION_1,
          purchaseOrderApi.schema.CREATED_BY_USER,
          purchaseOrderApi.schema.CREATION_DATE,
          purchaseOrderApi.schema.LAST_CHANGE_DATE_TIME,
          purchaseOrderApi.schema.PURCHASING_DOCUMENT_DELETION_CODE,
          purchaseOrderApi.schema.RELEASE_IS_NOT_COMPLETED,
          purchaseOrderApi.schema.PURCHASING_COMPLETENESS_STATUS,
          purchaseOrderApi.schema.TO_PURCHASE_ORDER_ITEM.select(
            this.svc.purchaseOrderItemApi.schema.PURCHASE_ORDER_ITEM,
            this.svc.purchaseOrderItemApi.schema.PURCHASE_ORDER_ITEM_TEXT,
            this.svc.purchaseOrderItemApi.schema.MATERIAL,
            this.svc.purchaseOrderItemApi.schema.ORDER_QUANTITY,
            this.svc.purchaseOrderItemApi.schema.PURCHASE_ORDER_QUANTITY_UNIT,
            this.svc.purchaseOrderItemApi.schema.NET_PRICE_AMOUNT,
            this.svc.purchaseOrderItemApi.schema.DOCUMENT_CURRENCY,
            this.svc.purchaseOrderItemApi.schema.PLANT,
            this.svc.purchaseOrderItemApi.schema.PURCHASING_DOCUMENT_DELETION_CODE,
            this.svc.purchaseOrderItemApi.schema.IS_COMPLETELY_DELIVERED,
            this.svc.purchaseOrderItemApi.schema.IS_FINALLY_INVOICED,
            this.svc.purchaseOrderItemApi.schema.TO_SCHEDULE_LINE,
          ),
        )
        .execute(this.destination);
    });
  }

  async getAll(
    filters?: PurchaseOrderFilters,
  ): Promise<ServiceResult<PurchaseOrder[]>> {
    return this.execute(() => {
      const { purchaseOrderApi } = this.svc;
      const builder = purchaseOrderApi
        .requestBuilder()
        .getAll()
        .select(
          purchaseOrderApi.schema.PURCHASE_ORDER,
          purchaseOrderApi.schema.COMPANY_CODE,
          purchaseOrderApi.schema.PURCHASE_ORDER_TYPE,
          purchaseOrderApi.schema.SUPPLIER,
          purchaseOrderApi.schema.PURCHASING_ORGANIZATION,
          purchaseOrderApi.schema.PURCHASING_GROUP,
          purchaseOrderApi.schema.PURCHASE_ORDER_DATE,
          purchaseOrderApi.schema.DOCUMENT_CURRENCY,
          purchaseOrderApi.schema.CREATED_BY_USER,
          purchaseOrderApi.schema.CREATION_DATE,
          purchaseOrderApi.schema.PURCHASING_DOCUMENT_DELETION_CODE,
        );

      if (filters?.top !== undefined) builder.top(filters.top);
      if (filters?.skip !== undefined) builder.skip(filters.skip);

      const filterConditions = [];
      if (filters?.supplier) {
        filterConditions.push(
          purchaseOrderApi.schema.SUPPLIER.equals(filters.supplier),
        );
      }
      if (filters?.companyCode) {
        filterConditions.push(
          purchaseOrderApi.schema.COMPANY_CODE.equals(filters.companyCode),
        );
      }
      if (filters?.purchasingOrganization) {
        filterConditions.push(
          purchaseOrderApi.schema.PURCHASING_ORGANIZATION.equals(
            filters.purchasingOrganization,
          ),
        );
      }
      if (filters?.purchasingGroup) {
        filterConditions.push(
          purchaseOrderApi.schema.PURCHASING_GROUP.equals(
            filters.purchasingGroup,
          ),
        );
      }
      if (filters?.orderType) {
        filterConditions.push(
          purchaseOrderApi.schema.PURCHASE_ORDER_TYPE.equals(filters.orderType),
        );
      }

      if (filterConditions.length > 0) {
        builder.filter(...filterConditions);
      }

      return builder.execute(this.destination);
    });
  }

  async create(
    input: CreatePurchaseOrderInput,
  ): Promise<ServiceResult<PurchaseOrder>> {
    return this.execute(() => {
      const { purchaseOrderApi, purchaseOrderItemApi } = this.svc;

      const items = input.items.map((item, index) => {
        const deliveryMs = new Date(item.deliveryDate).getTime();
        if (Number.isNaN(deliveryMs)) {
          throw new Error(
            `Invalid deliveryDate "${item.deliveryDate}" for item ${item.itemNumber ?? index + 1}`,
          );
        }

        const poItem = purchaseOrderItemApi
          .entityBuilder()
          .purchaseOrderItem(item.itemNumber ?? String((index + 1) * 10))
          .material(item.material)
          .orderQuantity(new BigNumber(item.quantity))
          .purchaseOrderQuantityUnit(item.unit)
          .plant(item.plant)
          .netPriceAmount(new BigNumber(item.netPrice))
          .netPriceQuantity(new BigNumber(item.priceUnit ?? 1))
          .build();

        if (item.description) {
          poItem.purchaseOrderItemText = item.description;
        }

        if (item.accountAssignment) {
          poItem.accountAssignmentCategory = item.accountAssignment.category;
        }

        // Deep insert: schedule line via OData navigation property.
        // Uses raw OData wire-format names (e.g. ScheduleLineDeliveryDate) because
        // the SDK's typed builders don't support nested entity creation in a single
        // request. This is a known SDK limitation for deep insert payloads.
        (poItem as unknown as Record<string, unknown>).toScheduleLine = [
          {
            ScheduleLineDeliveryDate: `/Date(${deliveryMs})/`,
            ScheduleLineOrderQuantity: String(item.quantity),
          },
        ];

        // Deep insert: account assignment if provided
        if (item.accountAssignment) {
          const acctAssignment: Record<string, string> = {};
          if (item.accountAssignment.costCenter) {
            acctAssignment.CostCenter = item.accountAssignment.costCenter;
          }
          if (item.accountAssignment.glAccount) {
            acctAssignment.GLAccount = item.accountAssignment.glAccount;
          }
          if (item.accountAssignment.wbsElement) {
            acctAssignment.WBSElement = item.accountAssignment.wbsElement;
          }
          (poItem as unknown as Record<string, unknown>).toAccountAssignment = [
            acctAssignment,
          ];
        }

        return poItem;
      });

      const entity = purchaseOrderApi
        .entityBuilder()
        .companyCode(input.companyCode)
        .purchaseOrderType(input.orderType)
        .supplier(input.supplier)
        .purchasingOrganization(input.purchasingOrg)
        .purchasingGroup(input.purchasingGroup)
        .documentCurrency(input.currency)
        .build();

      entity.toPurchaseOrderItem = items;

      return purchaseOrderApi
        .requestBuilder()
        .create(entity)
        .execute(this.destination);
    });
  }

  async updateHeader(
    purchaseOrderId: string,
    changes: UpdatePOHeaderInput,
  ): Promise<ServiceResult<PurchaseOrder>> {
    return this.execute(async () => {
      const { purchaseOrderApi } = this.svc;

      // Read first to get ETag for optimistic locking
      const existing = await purchaseOrderApi
        .requestBuilder()
        .getByKey(purchaseOrderId)
        .execute(this.destination);

      if (changes.supplier !== undefined) existing.supplier = changes.supplier;
      if (changes.paymentTerms !== undefined)
        existing.paymentTerms = changes.paymentTerms;
      if (changes.purchasingGroup !== undefined)
        existing.purchasingGroup = changes.purchasingGroup;
      if (changes.documentCurrency !== undefined)
        existing.documentCurrency = changes.documentCurrency;
      if (changes.incotermsClassification !== undefined)
        existing.incotermsClassification = changes.incotermsClassification;
      if (changes.incotermsLocation1 !== undefined)
        existing.incotermsLocation1 = changes.incotermsLocation1;

      return purchaseOrderApi
        .requestBuilder()
        .update(existing)
        .execute(this.destination);
    });
  }

  async getItems(
    purchaseOrderId: string,
  ): Promise<ServiceResult<PurchaseOrderItem[]>> {
    const result = await this.execute(() => {
      const { purchaseOrderItemApi } = this.svc;
      return purchaseOrderItemApi
        .requestBuilder()
        .getAll()
        .filter(
          purchaseOrderItemApi.schema.PURCHASE_ORDER.equals(purchaseOrderId),
        )
        .execute(this.destination);
    });

    // Disambiguate: empty because PO has no items, or PO doesn't exist?
    if (result.success && result.data.length === 0) {
      const error = await this.verifyPoExists<PurchaseOrderItem[]>(
        purchaseOrderId,
        this.svc.purchaseOrderApi,
      );
      if (error) return error;
    }

    return result;
  }

  async getItem(
    purchaseOrderId: string,
    itemNumber: string,
  ): Promise<ServiceResult<PurchaseOrderItem>> {
    return this.execute(() => {
      const { purchaseOrderItemApi } = this.svc;
      return purchaseOrderItemApi
        .requestBuilder()
        .getByKey(purchaseOrderId, itemNumber)
        .execute(this.destination);
    });
  }

  async updateItem(
    purchaseOrderId: string,
    itemNumber: string,
    changes: UpdatePOItemInput,
  ): Promise<ServiceResult<PurchaseOrderItem>> {
    return this.execute(async () => {
      const { purchaseOrderItemApi } = this.svc;

      const existing = await purchaseOrderItemApi
        .requestBuilder()
        .getByKey(purchaseOrderId, itemNumber)
        .execute(this.destination);

      if (changes.quantity !== undefined)
        existing.orderQuantity = new BigNumber(changes.quantity);
      if (changes.netPrice !== undefined)
        existing.netPriceAmount = new BigNumber(changes.netPrice);
      if (changes.plant !== undefined) existing.plant = changes.plant;
      if (changes.description !== undefined)
        existing.purchaseOrderItemText = changes.description;

      return purchaseOrderItemApi
        .requestBuilder()
        .update(existing)
        .execute(this.destination);
    });
  }

  /**
   * Deletes a purchase order. In SAP, the OData DELETE on
   * API_PURCHASEORDER_PROCESS_SRV sets the PurchasingDocumentDeletionCode
   * (soft delete / deletion indicator), it does NOT hard-delete the document.
   */
  async delete(purchaseOrderId: string): Promise<ServiceResult<void>> {
    return this.execute(() => {
      const { purchaseOrderApi } = this.svc;
      return purchaseOrderApi
        .requestBuilder()
        .delete(purchaseOrderId)
        .execute(this.destination);
    });
  }

  async deleteItem(
    purchaseOrderId: string,
    itemNumber: string,
  ): Promise<ServiceResult<void>> {
    return this.execute(() => {
      const { purchaseOrderItemApi } = this.svc;
      return purchaseOrderItemApi
        .requestBuilder()
        .delete(purchaseOrderId, itemNumber)
        .execute(this.destination);
    });
  }

  async addItem(
    purchaseOrderId: string,
    item: AddPOItemInput,
  ): Promise<ServiceResult<PurchaseOrderItem>> {
    return this.execute(() => {
      const { purchaseOrderItemApi } = this.svc;

      const entity = purchaseOrderItemApi
        .entityBuilder()
        .purchaseOrder(purchaseOrderId)
        .purchaseOrderItem(item.itemNumber)
        .material(item.material)
        .orderQuantity(new BigNumber(item.quantity))
        .purchaseOrderQuantityUnit(item.unit)
        .plant(item.plant)
        .netPriceAmount(new BigNumber(item.netPrice))
        .netPriceQuantity(new BigNumber(item.priceUnit ?? 1))
        .build();

      if (item.description) {
        entity.purchaseOrderItemText = item.description;
      }

      return purchaseOrderItemApi
        .requestBuilder()
        .create(entity)
        .execute(this.destination);
    });
  }
}
