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
import type { PoSubcontractingComponentApi } from './PoSubcontractingComponentApi';

/**
 * This class represents the entity "A_POSubcontractingComponent" of service "API_PURCHASEORDER_PROCESS_SRV".
 */
export class PoSubcontractingComponent<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements PoSubcontractingComponentType<T>
{
  /**
   * Technical entity name for PoSubcontractingComponent.
   */
  static override _entityName = 'A_POSubcontractingComponent';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath =
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
  /**
   * All key fields of the PoSubcontractingComponent entity.
   */
  static _keys = [
    'PurchaseOrder',
    'PurchaseOrderItem',
    'ScheduleLine',
    'ReservationItem',
    'RecordType'
  ];
  /**
   * Purchasing Document.
   * Maximum length: 10.
   */
  declare purchaseOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Purchasing Document Item.
   * Maximum length: 5.
   */
  declare purchaseOrderItem: DeserializedType<T, 'Edm.String'>;
  /**
   * Delivery Schedule Line Counter.
   * Maximum length: 4.
   */
  declare scheduleLine: DeserializedType<T, 'Edm.String'>;
  /**
   * Reservation Item.
   * Maximum length: 4.
   */
  declare reservationItem: DeserializedType<T, 'Edm.String'>;
  /**
   * Reservation Record Type.
   * Maximum length: 1.
   */
  declare recordType: DeserializedType<T, 'Edm.String'>;
  /**
   * Material Number.
   * Maximum length: 40.
   * @nullable
   */
  declare material?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * BOM Item Text.
   * Maximum length: 40.
   * @nullable
   */
  declare bomItemDescription?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Requirement Quantity.
   * @nullable
   */
  declare requiredQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Base Unit of Measure.
   * Maximum length: 3.
   * @nullable
   */
  declare baseUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Material Component Requirement Date.
   * @nullable
   */
  declare requirementDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Quantity in Unit of Entry.
   * @nullable
   */
  declare quantityInEntryUnit?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Unit of entry.
   * Maximum length: 3.
   * @nullable
   */
  declare entryUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Withdrawn Quantity.
   * @nullable
   */
  declare withdrawnQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Plant.
   * Maximum length: 4.
   * @nullable
   */
  declare plant?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Batch Number.
   * Maximum length: 10.
   * @nullable
   */
  declare batch?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Requirement Segment.
   * Maximum length: 40.
   * @nullable
   */
  declare requirementSegment?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: PoSubcontractingComponentApi<T>) {
    super(_entityApi);
  }
}

export interface PoSubcontractingComponentType<
  T extends DeSerializers = DefaultDeSerializers
> {
  purchaseOrder: DeserializedType<T, 'Edm.String'>;
  purchaseOrderItem: DeserializedType<T, 'Edm.String'>;
  scheduleLine: DeserializedType<T, 'Edm.String'>;
  reservationItem: DeserializedType<T, 'Edm.String'>;
  recordType: DeserializedType<T, 'Edm.String'>;
  material?: DeserializedType<T, 'Edm.String'> | null;
  bomItemDescription?: DeserializedType<T, 'Edm.String'> | null;
  requiredQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  baseUnit?: DeserializedType<T, 'Edm.String'> | null;
  requirementDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  quantityInEntryUnit?: DeserializedType<T, 'Edm.Decimal'> | null;
  entryUnit?: DeserializedType<T, 'Edm.String'> | null;
  withdrawnQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  plant?: DeserializedType<T, 'Edm.String'> | null;
  batch?: DeserializedType<T, 'Edm.String'> | null;
  requirementSegment?: DeserializedType<T, 'Edm.String'> | null;
}
