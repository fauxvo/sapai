/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  Entity,
  DefaultDeSerializers,
  DeSerializers,
  DeserializedType
} from '@sap-cloud-sdk/odata-v2';
import type { PurchaseOrderScheduleLineApi } from './PurchaseOrderScheduleLineApi';
import {
  PoSubcontractingComponent,
  PoSubcontractingComponentType
} from './PoSubcontractingComponent';

/**
 * This class represents the entity "A_PurchaseOrderScheduleLine" of service "API_PURCHASEORDER_PROCESS_SRV".
 */
export class PurchaseOrderScheduleLine<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements PurchaseOrderScheduleLineType<T>
{
  /**
   * Technical entity name for PurchaseOrderScheduleLine.
   */
  static override _entityName = 'A_PurchaseOrderScheduleLine';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath =
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
  /**
   * All key fields of the PurchaseOrderScheduleLine entity.
   */
  static _keys = [
    'PurchasingDocument',
    'PurchasingDocumentItem',
    'ScheduleLine'
  ];
  /**
   * Purchasing Document Number.
   * Maximum length: 10.
   */
  declare purchasingDocument: DeserializedType<T, 'Edm.String'>;
  /**
   * Item Number of Purchasing Document.
   * Maximum length: 5.
   */
  declare purchasingDocumentItem: DeserializedType<T, 'Edm.String'>;
  /**
   * Delivery Schedule Line Counter.
   * Maximum length: 4.
   */
  declare scheduleLine: DeserializedType<T, 'Edm.String'>;
  /**
   * Category of delivery date.
   * Maximum length: 1.
   * @nullable
   */
  declare delivDateCategory?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Item Delivery Date.
   * @nullable
   */
  declare scheduleLineDeliveryDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Purchase Order Unit of Measure.
   * Maximum length: 3.
   * @nullable
   */
  declare purchaseOrderQuantityUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Scheduled Quantity.
   * @nullable
   */
  declare scheduleLineOrderQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Delivery Date Time-Spot.
   * @nullable
   */
  declare scheduleLineDeliveryTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Statistics-Relevant Delivery Date.
   * @nullable
   */
  declare schedLineStscDeliveryDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * Purchase Requisition Number.
   * Maximum length: 10.
   * @nullable
   */
  declare purchaseRequisition?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Item number of purchase requisition.
   * Maximum length: 5.
   * @nullable
   */
  declare purchaseRequisitionItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Committed Quantity.
   * @nullable
   */
  declare scheduleLineCommittedQuantity?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Start Date for Period of Performance.
   * @nullable
   */
  declare performancePeriodStartDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * End Date for Period of Performance.
   * @nullable
   */
  declare performancePeriodEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * One-to-many navigation property to the {@link PoSubcontractingComponent} entity.
   */
  declare toSubcontractingComponent: PoSubcontractingComponent<T>[];

  constructor(_entityApi: PurchaseOrderScheduleLineApi<T>) {
    super(_entityApi);
  }
}

export interface PurchaseOrderScheduleLineType<
  T extends DeSerializers = DefaultDeSerializers
> {
  purchasingDocument: DeserializedType<T, 'Edm.String'>;
  purchasingDocumentItem: DeserializedType<T, 'Edm.String'>;
  scheduleLine: DeserializedType<T, 'Edm.String'>;
  delivDateCategory?: DeserializedType<T, 'Edm.String'> | null;
  scheduleLineDeliveryDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  purchaseOrderQuantityUnit?: DeserializedType<T, 'Edm.String'> | null;
  scheduleLineOrderQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  scheduleLineDeliveryTime?: DeserializedType<T, 'Edm.Time'> | null;
  schedLineStscDeliveryDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  purchaseRequisition?: DeserializedType<T, 'Edm.String'> | null;
  purchaseRequisitionItem?: DeserializedType<T, 'Edm.String'> | null;
  scheduleLineCommittedQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  performancePeriodStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  performancePeriodEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  toSubcontractingComponent: PoSubcontractingComponentType<T>[];
}
