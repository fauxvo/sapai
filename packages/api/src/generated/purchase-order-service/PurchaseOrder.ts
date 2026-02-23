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
import type { PurchaseOrderApi } from './PurchaseOrderApi';
import { PurchaseOrderItem, PurchaseOrderItemType } from './PurchaseOrderItem';
import { PurchaseOrderNote, PurchaseOrderNoteType } from './PurchaseOrderNote';

/**
 * This class represents the entity "A_PurchaseOrder" of service "API_PURCHASEORDER_PROCESS_SRV".
 */
export class PurchaseOrder<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements PurchaseOrderType<T>
{
  /**
   * Technical entity name for PurchaseOrder.
   */
  static override _entityName = 'A_PurchaseOrder';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath =
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
  /**
   * All key fields of the PurchaseOrder entity.
   */
  static _keys = ['PurchaseOrder'];
  /**
   * Purchase Order Number.
   * Maximum length: 10.
   */
  declare purchaseOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Company Code.
   * Maximum length: 4.
   * @nullable
   */
  declare companyCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Purchasing Document Type.
   * Maximum length: 4.
   * @nullable
   */
  declare purchaseOrderType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Purchase Order Deletion Code.
   * Maximum length: 1.
   * @nullable
   */
  declare purchasingDocumentDeletionCode?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Purchasing Document Processing State.
   * Maximum length: 2.
   * @nullable
   */
  declare purchasingProcessingStatus?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * User of person who created a purchasing document.
   * Maximum length: 12.
   * @nullable
   */
  declare createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Creation Date of Purchasing Document.
   * @nullable
   */
  declare creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Change Time Stamp.
   * @nullable
   */
  declare lastChangeDateTime?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  /**
   * Supplier.
   * Maximum length: 10.
   * @nullable
   */
  declare supplier?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Control indicator for purchasing document type.
   * Maximum length: 1.
   * @nullable
   */
  declare purchaseOrderSubtype?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Language Key.
   * Maximum length: 2.
   * @nullable
   */
  declare language?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Terms of Payment Key.
   * Maximum length: 4.
   * @nullable
   */
  declare paymentTerms?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Cash Discount Days 1.
   * @nullable
   */
  declare cashDiscount1Days?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Cash Discount Days 2.
   * @nullable
   */
  declare cashDiscount2Days?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Net Payment Terms Period.
   * @nullable
   */
  declare netPaymentDays?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Cash Discount Percentage 1.
   * @nullable
   */
  declare cashDiscount1Percent?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Cash Discount Percentage 2.
   * @nullable
   */
  declare cashDiscount2Percent?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Purchasing Organization.
   * Maximum length: 4.
   * @nullable
   */
  declare purchasingOrganization?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Status of Purchasing Document.
   * Maximum length: 1.
   * @nullable
   */
  declare purchasingDocumentOrigin?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Purchasing Group.
   * Maximum length: 3.
   * @nullable
   */
  declare purchasingGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Purchase Order Date.
   * @nullable
   */
  declare purchaseOrderDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Currency Key.
   * Maximum length: 5.
   * @nullable
   */
  declare documentCurrency?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Exchange Rate.
   * Maximum length: 12.
   * @nullable
   */
  declare exchangeRate?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Indicator for Fixed Exchange Rate.
   * @nullable
   */
  declare exchangeRateIsFixed?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Start of Validity Period.
   * @nullable
   */
  declare validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * End of Validity Period.
   * @nullable
   */
  declare validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Quotation Number.
   * Maximum length: 10.
   * @nullable
   */
  declare supplierQuotationExternalId?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Collective Number.
   * Maximum length: 10.
   * @nullable
   */
  declare purchasingCollectiveNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Responsible Salesperson at Supplier's Office.
   * Maximum length: 30.
   * @nullable
   */
  declare supplierRespSalesPersonName?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Supplier's Phone Number.
   * Maximum length: 16.
   * @nullable
   */
  declare supplierPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Goods Supplier.
   * Maximum length: 10.
   * @nullable
   */
  declare supplyingSupplier?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Supplying (issuing) plant in case of stock transport order.
   * Maximum length: 4.
   * @nullable
   */
  declare supplyingPlant?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms (Part 1).
   * Maximum length: 3.
   * @nullable
   */
  declare incotermsClassification?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Your Reference.
   * Maximum length: 12.
   * @nullable
   */
  declare correspncExternalReference?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Our Reference.
   * Maximum length: 12.
   * @nullable
   */
  declare correspncInternalReference?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Different Invoicing Party.
   * Maximum length: 10.
   * @nullable
   */
  declare invoicingParty?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Release Not Yet Completely Effected.
   * @nullable
   */
  declare releaseIsNotCompleted?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Purchase order not yet complete.
   * @nullable
   */
  declare purchasingCompletenessStatus?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Incoterms Version.
   * Maximum length: 4.
   * @nullable
   */
  declare incotermsVersion?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms Location 1.
   * Maximum length: 70.
   * @nullable
   */
  declare incotermsLocation1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms Location 2.
   * Maximum length: 70.
   * @nullable
   */
  declare incotermsLocation2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Address Number.
   * Maximum length: 10.
   * @nullable
   */
  declare manualSupplierAddressId?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Purpose Completed.
   * Maximum length: 1.
   * @nullable
   */
  declare isEndOfPurposeBlocked?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City.
   * Maximum length: 40.
   * @nullable
   */
  declare addressCityName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Complete Number: Dialing Code+Number+Extension.
   * Maximum length: 30.
   * @nullable
   */
  declare addressFaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * House Number.
   * Maximum length: 10.
   * @nullable
   */
  declare addressHouseNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 1.
   * Maximum length: 40.
   * @nullable
   */
  declare addressName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City postal code.
   * Maximum length: 10.
   * @nullable
   */
  declare addressPostalCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Street.
   * Maximum length: 60.
   * @nullable
   */
  declare addressStreetName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Complete Number: Dialing Code+Number+Extension.
   * Maximum length: 30.
   * @nullable
   */
  declare addressPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Region (State, Province, County).
   * Maximum length: 3.
   * @nullable
   */
  declare addressRegion?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Country/Region Key.
   * Maximum length: 3.
   * @nullable
   */
  declare addressCountry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Language Key.
   * Maximum length: 2.
   * @nullable
   */
  declare addressCorrespondenceLanguage?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Product Compliance Supplier Check Status (All Items).
   * Maximum length: 1.
   * @nullable
   */
  declare purgAggrgdProdCmplncSuplrSts?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Product Marketability Status (All Items).
   * Maximum length: 1.
   * @nullable
   */
  declare purgAggrgdProdMarketabilitySts?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Safety Data Sheet Status (All Items).
   * Maximum length: 1.
   * @nullable
   */
  declare purgAggrgdSftyDataSheetStatus?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Dangerous Goods Status (All Items).
   * Maximum length: 1.
   * @nullable
   */
  declare purgProdCmplncTotDngrsGoodsSts?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * One-to-many navigation property to the {@link PurchaseOrderItem} entity.
   */
  declare toPurchaseOrderItem: PurchaseOrderItem<T>[];
  /**
   * One-to-many navigation property to the {@link PurchaseOrderNote} entity.
   */
  declare toPurchaseOrderNote: PurchaseOrderNote<T>[];

  constructor(_entityApi: PurchaseOrderApi<T>) {
    super(_entityApi);
  }
}

export interface PurchaseOrderType<
  T extends DeSerializers = DefaultDeSerializers
> {
  purchaseOrder: DeserializedType<T, 'Edm.String'>;
  companyCode?: DeserializedType<T, 'Edm.String'> | null;
  purchaseOrderType?: DeserializedType<T, 'Edm.String'> | null;
  purchasingDocumentDeletionCode?: DeserializedType<T, 'Edm.String'> | null;
  purchasingProcessingStatus?: DeserializedType<T, 'Edm.String'> | null;
  createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  lastChangeDateTime?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  supplier?: DeserializedType<T, 'Edm.String'> | null;
  purchaseOrderSubtype?: DeserializedType<T, 'Edm.String'> | null;
  language?: DeserializedType<T, 'Edm.String'> | null;
  paymentTerms?: DeserializedType<T, 'Edm.String'> | null;
  cashDiscount1Days?: DeserializedType<T, 'Edm.Decimal'> | null;
  cashDiscount2Days?: DeserializedType<T, 'Edm.Decimal'> | null;
  netPaymentDays?: DeserializedType<T, 'Edm.Decimal'> | null;
  cashDiscount1Percent?: DeserializedType<T, 'Edm.Decimal'> | null;
  cashDiscount2Percent?: DeserializedType<T, 'Edm.Decimal'> | null;
  purchasingOrganization?: DeserializedType<T, 'Edm.String'> | null;
  purchasingDocumentOrigin?: DeserializedType<T, 'Edm.String'> | null;
  purchasingGroup?: DeserializedType<T, 'Edm.String'> | null;
  purchaseOrderDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  documentCurrency?: DeserializedType<T, 'Edm.String'> | null;
  exchangeRate?: DeserializedType<T, 'Edm.String'> | null;
  exchangeRateIsFixed?: DeserializedType<T, 'Edm.Boolean'> | null;
  validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  supplierQuotationExternalId?: DeserializedType<T, 'Edm.String'> | null;
  purchasingCollectiveNumber?: DeserializedType<T, 'Edm.String'> | null;
  supplierRespSalesPersonName?: DeserializedType<T, 'Edm.String'> | null;
  supplierPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  supplyingSupplier?: DeserializedType<T, 'Edm.String'> | null;
  supplyingPlant?: DeserializedType<T, 'Edm.String'> | null;
  incotermsClassification?: DeserializedType<T, 'Edm.String'> | null;
  correspncExternalReference?: DeserializedType<T, 'Edm.String'> | null;
  correspncInternalReference?: DeserializedType<T, 'Edm.String'> | null;
  invoicingParty?: DeserializedType<T, 'Edm.String'> | null;
  releaseIsNotCompleted?: DeserializedType<T, 'Edm.Boolean'> | null;
  purchasingCompletenessStatus?: DeserializedType<T, 'Edm.Boolean'> | null;
  incotermsVersion?: DeserializedType<T, 'Edm.String'> | null;
  incotermsLocation1?: DeserializedType<T, 'Edm.String'> | null;
  incotermsLocation2?: DeserializedType<T, 'Edm.String'> | null;
  manualSupplierAddressId?: DeserializedType<T, 'Edm.String'> | null;
  isEndOfPurposeBlocked?: DeserializedType<T, 'Edm.String'> | null;
  addressCityName?: DeserializedType<T, 'Edm.String'> | null;
  addressFaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  addressHouseNumber?: DeserializedType<T, 'Edm.String'> | null;
  addressName?: DeserializedType<T, 'Edm.String'> | null;
  addressPostalCode?: DeserializedType<T, 'Edm.String'> | null;
  addressStreetName?: DeserializedType<T, 'Edm.String'> | null;
  addressPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  addressRegion?: DeserializedType<T, 'Edm.String'> | null;
  addressCountry?: DeserializedType<T, 'Edm.String'> | null;
  addressCorrespondenceLanguage?: DeserializedType<T, 'Edm.String'> | null;
  purgAggrgdProdCmplncSuplrSts?: DeserializedType<T, 'Edm.String'> | null;
  purgAggrgdProdMarketabilitySts?: DeserializedType<T, 'Edm.String'> | null;
  purgAggrgdSftyDataSheetStatus?: DeserializedType<T, 'Edm.String'> | null;
  purgProdCmplncTotDngrsGoodsSts?: DeserializedType<T, 'Edm.String'> | null;
  toPurchaseOrderItem: PurchaseOrderItemType<T>[];
  toPurchaseOrderNote: PurchaseOrderNoteType<T>[];
}
