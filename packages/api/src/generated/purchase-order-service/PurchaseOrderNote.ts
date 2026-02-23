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
import type { PurchaseOrderNoteApi } from './PurchaseOrderNoteApi';

/**
 * This class represents the entity "A_PurchaseOrderNote" of service "API_PURCHASEORDER_PROCESS_SRV".
 */
export class PurchaseOrderNote<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements PurchaseOrderNoteType<T>
{
  /**
   * Technical entity name for PurchaseOrderNote.
   */
  static override _entityName = 'A_PurchaseOrderNote';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath =
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
  /**
   * All key fields of the PurchaseOrderNote entity.
   */
  static _keys = ['PurchaseOrder', 'TextObjectType', 'Language'];
  /**
   * Purchasing Document Number.
   * Maximum length: 10.
   */
  declare purchaseOrder: DeserializedType<T, 'Edm.String'>;
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

  constructor(_entityApi: PurchaseOrderNoteApi<T>) {
    super(_entityApi);
  }
}

export interface PurchaseOrderNoteType<
  T extends DeSerializers = DefaultDeSerializers
> {
  purchaseOrder: DeserializedType<T, 'Edm.String'>;
  textObjectType: DeserializedType<T, 'Edm.String'>;
  language: DeserializedType<T, 'Edm.String'>;
  plainLongText?: DeserializedType<T, 'Edm.String'> | null;
}
