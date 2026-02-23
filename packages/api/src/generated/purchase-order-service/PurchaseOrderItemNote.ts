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
import type { PurchaseOrderItemNoteApi } from './PurchaseOrderItemNoteApi';

/**
 * This class represents the entity "A_PurchaseOrderItemNote" of service "API_PURCHASEORDER_PROCESS_SRV".
 */
export class PurchaseOrderItemNote<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements PurchaseOrderItemNoteType<T>
{
  /**
   * Technical entity name for PurchaseOrderItemNote.
   */
  static override _entityName = 'A_PurchaseOrderItemNote';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath =
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
  /**
   * All key fields of the PurchaseOrderItemNote entity.
   */
  static _keys = [
    'PurchaseOrder',
    'PurchaseOrderItem',
    'TextObjectType',
    'Language'
  ];
  /**
   * Purchasing Document Number.
   * Maximum length: 10.
   */
  declare purchaseOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Item Number of Purchasing Document.
   * Maximum length: 5.
   */
  declare purchaseOrderItem: DeserializedType<T, 'Edm.String'>;
  /**
   * Text ID.
   * Maximum length: 4.
   */
  declare textObjectType: DeserializedType<T, 'Edm.String'>;
  /**
   * Language Key.
   * Maximum length: 2.
   */
  declare language: DeserializedType<T, 'Edm.String'>;
  /**
   * Long Text.
   * @nullable
   */
  declare plainLongText?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: PurchaseOrderItemNoteApi<T>) {
    super(_entityApi);
  }
}

export interface PurchaseOrderItemNoteType<
  T extends DeSerializers = DefaultDeSerializers
> {
  purchaseOrder: DeserializedType<T, 'Edm.String'>;
  purchaseOrderItem: DeserializedType<T, 'Edm.String'>;
  textObjectType: DeserializedType<T, 'Edm.String'>;
  language: DeserializedType<T, 'Edm.String'>;
  plainLongText?: DeserializedType<T, 'Edm.String'> | null;
}
