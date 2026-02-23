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
import type { PurchaseOrderItemApi } from './PurchaseOrderItemApi';
import { PurchaseOrder, PurchaseOrderType } from './PurchaseOrder';
import {
  PurOrdAccountAssignment,
  PurOrdAccountAssignmentType
} from './PurOrdAccountAssignment';
import {
  PurchaseOrderItemNote,
  PurchaseOrderItemNoteType
} from './PurchaseOrderItemNote';
import {
  PurOrdPricingElement,
  PurOrdPricingElementType
} from './PurOrdPricingElement';
import {
  PurchaseOrderScheduleLine,
  PurchaseOrderScheduleLineType
} from './PurchaseOrderScheduleLine';

/**
 * This class represents the entity "A_PurchaseOrderItem" of service "API_PURCHASEORDER_PROCESS_SRV".
 */
export class PurchaseOrderItem<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements PurchaseOrderItemType<T>
{
  /**
   * Technical entity name for PurchaseOrderItem.
   */
  static override _entityName = 'A_PurchaseOrderItem';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath =
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
  /**
   * All key fields of the PurchaseOrderItem entity.
   */
  static _keys = ['PurchaseOrder', 'PurchaseOrderItem'];
  /**
   * Purchase Order Number.
   * Maximum length: 10.
   */
  declare purchaseOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Item Number of Purchase Order.
   * Maximum length: 5.
   */
  declare purchaseOrderItem: DeserializedType<T, 'Edm.String'>;
  /**
   * Deletion Indicator in Purchasing Document.
   * Maximum length: 1.
   * @nullable
   */
  declare purchasingDocumentDeletionCode?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Short Text.
   * Maximum length: 40.
   * @nullable
   */
  declare purchaseOrderItemText?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Plant.
   * Maximum length: 4.
   * @nullable
   */
  declare plant?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Storage Location.
   * Maximum length: 4.
   * @nullable
   */
  declare storageLocation?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Material Group.
   * Maximum length: 9.
   * @nullable
   */
  declare materialGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Number of purchasing info record.
   * Maximum length: 10.
   * @nullable
   */
  declare purchasingInfoRecord?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Material Number Used by Supplier.
   * Maximum length: 35.
   * @nullable
   */
  declare supplierMaterialNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Purchase Order Quantity.
   * @nullable
   */
  declare orderQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Purchase Order Unit of Measure.
   * Maximum length: 3.
   * @nullable
   */
  declare purchaseOrderQuantityUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Order Price Unit (Purchasing).
   * Maximum length: 3.
   * @nullable
   */
  declare orderPriceUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Numerator for Conversion of Order Price Unit into Order Unit.
   * @nullable
   */
  declare orderPriceUnitToOrderUnitNmrtr?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Denominator for Conv. of Order Price Unit into Order Unit.
   * @nullable
   */
  declare ordPriceUnitToOrderUnitDnmntr?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Currency Key.
   * Maximum length: 5.
   * @nullable
   */
  declare documentCurrency?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Net Price in Purchasing Document (in Document Currency).
   * @nullable
   */
  declare netPriceAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Price Unit.
   * @nullable
   */
  declare netPriceQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Tax on sales/purchases code.
   * Maximum length: 2.
   * @nullable
   */
  declare taxCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Shipping Instructions.
   * Maximum length: 2.
   * @nullable
   */
  declare shippingInstruction?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date for Determining Tax Rates.
   * @nullable
   */
  declare taxDeterminationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Tax Reporting Country/Region.
   * Maximum length: 3.
   * @nullable
   */
  declare taxCountry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Price Printout.
   * @nullable
   */
  declare priceIsToBePrinted?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Overdelivery Tolerance.
   * @nullable
   */
  declare overdelivTolrtdLmtRatioInPct?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Unlimited Overdelivery Allowed.
   * @nullable
   */
  declare unlimitedOverdeliveryIsAllowed?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Underdelivery Tolerance.
   * @nullable
   */
  declare underdelivTolrtdLmtRatioInPct?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Valuation Type.
   * Maximum length: 10.
   * @nullable
   */
  declare valuationType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * "Delivery Completed" Indicator.
   * @nullable
   */
  declare isCompletelyDelivered?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Final Invoice Indicator.
   * @nullable
   */
  declare isFinallyInvoiced?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Item category in purchasing document.
   * Maximum length: 1.
   * @nullable
   */
  declare purchaseOrderItemCategory?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Account Assignment Category.
   * Maximum length: 1.
   * @nullable
   */
  declare accountAssignmentCategory?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Distribution Indicator for Multiple Account Assignment.
   * Maximum length: 1.
   * @nullable
   */
  declare multipleAcctAssgmtDistribution?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Partial invoice indicator.
   * Maximum length: 1.
   * @nullable
   */
  declare partialInvoiceDistribution?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Goods Receipt Indicator.
   * @nullable
   */
  declare goodsReceiptIsExpected?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Goods Receipt, Non-Valuated.
   * @nullable
   */
  declare goodsReceiptIsNonValuated?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Invoice Receipt Indicator.
   * @nullable
   */
  declare invoiceIsExpected?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Indicator: GR-Based Invoice Verification.
   * @nullable
   */
  declare invoiceIsGoodsReceiptBased?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Number of principal purchase agreement.
   * Maximum length: 10.
   * @nullable
   */
  declare purchaseContract?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Item Number of Principal Purchase Agreement.
   * Maximum length: 5.
   * @nullable
   */
  declare purchaseContractItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Customer.
   * Maximum length: 10.
   * @nullable
   */
  declare customer?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Supplier to be Supplied/Who is to Receive Delivery.
   * Maximum length: 10.
   * @nullable
   */
  declare subcontractor?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Subcontracting Supplier.
   * @nullable
   */
  declare supplierIsSubcontractor?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Net Weight.
   * @nullable
   */
  declare itemNetWeight?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Unit of Weight.
   * Maximum length: 3.
   * @nullable
   */
  declare itemWeightUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Jurisdiction.
   * Maximum length: 15.
   * @nullable
   */
  declare taxJurisdiction?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Price Determination (Pricing) Date Control.
   * Maximum length: 1.
   * @nullable
   */
  declare pricingDateControl?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Volume.
   * @nullable
   */
  declare itemVolume?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Volume Unit.
   * Maximum length: 3.
   * @nullable
   */
  declare itemVolumeUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Confirmation Control Key.
   * Maximum length: 4.
   * @nullable
   */
  declare supplierConfirmationControlKey?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Incoterms (Part 1).
   * Maximum length: 3.
   * @nullable
   */
  declare incotermsClassification?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms (Part 2).
   * Maximum length: 28.
   * @nullable
   */
  declare incotermsTransferLocation?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Evaluated Receipt Settlement (ERS).
   * @nullable
   */
  declare evaldRcptSettlmtIsAllowed?: DeserializedType<T, 'Edm.Boolean'> | null;
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
   * Returns Item.
   * @nullable
   */
  declare isReturnsItem?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Name of requisitioner/requester.
   * Maximum length: 12.
   * @nullable
   */
  declare requisitionerName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Package number.
   * Maximum length: 10.
   * @nullable
   */
  declare servicePackage?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Document Number for Earmarked Funds.
   * Maximum length: 10.
   * @nullable
   */
  declare earmarkedFunds?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Document Number for Earmarked Funds.
   * Maximum length: 10.
   * @nullable
   */
  declare earmarkedFundsDocument?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Earmarked Funds: Document Item.
   * Maximum length: 3.
   * @nullable
   */
  declare earmarkedFundsItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Earmarked Funds: Document Item.
   * Maximum length: 3.
   * @nullable
   */
  declare earmarkedFundsDocumentItem?: DeserializedType<T, 'Edm.String'> | null;
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
   * Material Number.
   * Maximum length: 40.
   * @nullable
   */
  declare material?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * International Article Number (EAN/UPC).
   * Maximum length: 18.
   * @nullable
   */
  declare internationalArticleNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Material number.
   * Maximum length: 40.
   * @nullable
   */
  declare manufacturerMaterial?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Service Performer.
   * Maximum length: 10.
   * @nullable
   */
  declare servicePerformer?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Product Type Group.
   * Maximum length: 2.
   * @nullable
   */
  declare productType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Expected Value of Overall Limit.
   * @nullable
   */
  declare expectedOverallLimitAmount?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Overall Limit.
   * @nullable
   */
  declare overallLimitAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Purchase Contract for Enhanced Limit.
   * Maximum length: 10.
   * @nullable
   */
  declare purContractForOverallLimit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Higher-Level Item in Purchasing Documents.
   * Maximum length: 5.
   * @nullable
   */
  declare purchasingParentItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Hierarchy Number.
   * Maximum length: 40.
   * @nullable
   */
  declare purgConfigurableItemNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Subitems Exist.
   * Maximum length: 1.
   * @nullable
   */
  declare purgDocAggrgdSubitemCategory?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Subitem Category, Purchasing Document.
   * Maximum length: 1.
   * @nullable
   */
  declare purgDocSubitemCategory?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * External Sort Number.
   * Maximum length: 5.
   * @nullable
   */
  declare purgExternalSortNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Batch Number.
   * Maximum length: 10.
   * @nullable
   */
  declare batch?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Free Item.
   * @nullable
   */
  declare purchasingItemIsFreeOfCharge?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Number of delivery address.
   * Maximum length: 10.
   * @nullable
   */
  declare referenceDeliveryAddressId?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Manual address number in purchasing document item.
   * Maximum length: 10.
   * @nullable
   */
  declare deliveryAddressId?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 1.
   * Maximum length: 40.
   * @nullable
   */
  declare deliveryAddressName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 2.
   * Maximum length: 40.
   * @nullable
   */
  declare deliveryAddressName2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Full Name of Person.
   * Maximum length: 80.
   * @nullable
   */
  declare deliveryAddressFullName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Street.
   * Maximum length: 60.
   * @nullable
   */
  declare deliveryAddressStreetName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * House Number.
   * Maximum length: 10.
   * @nullable
   */
  declare deliveryAddressHouseNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City.
   * Maximum length: 40.
   * @nullable
   */
  declare deliveryAddressCityName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City postal code.
   * Maximum length: 10.
   * @nullable
   */
  declare deliveryAddressPostalCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Region (State, Province, County).
   * Maximum length: 3.
   * @nullable
   */
  declare deliveryAddressRegion?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Country/Region Key.
   * Maximum length: 3.
   * @nullable
   */
  declare deliveryAddressCountry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * District.
   * Maximum length: 40.
   * @nullable
   */
  declare deliveryAddressDistrictName?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Down Payment Indicator.
   * Maximum length: 4.
   * @nullable
   */
  declare downPaymentType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Down Payment Percentage.
   * @nullable
   */
  declare downPaymentPercentageOfTotAmt?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Down Payment Amount in Document Currency.
   * @nullable
   */
  declare downPaymentAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Due Date for Down Payment.
   * @nullable
   */
  declare downPaymentDueDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Usage of the material.
   * Maximum length: 1.
   * @nullable
   */
  declare brMaterialUsage?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Origin of the material.
   * Maximum length: 1.
   * @nullable
   */
  declare brMaterialOrigin?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Material CFOP Category.
   * Maximum length: 2.
   * @nullable
   */
  declare brCfopCategory?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * In-House Production.
   * @nullable
   */
  declare brIsProducedInHouse?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Brazilian NCM Code.
   * Maximum length: 16.
   * @nullable
   */
  declare consumptionTaxCtrlCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Product Compliance Supplier Check Status (Item).
   * Maximum length: 1.
   * @nullable
   */
  declare purgProdCmplncSupplierStatus?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Product Marketability Status (Item).
   * Maximum length: 1.
   * @nullable
   */
  declare purgProductMarketabilityStatus?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Safety Data Sheet Status (Item).
   * Maximum length: 1.
   * @nullable
   */
  declare purgSafetyDataSheetStatus?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Dangerous Goods Status (Item).
   * Maximum length: 1.
   * @nullable
   */
  declare purgProdCmplncDngrsGoodsStatus?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Stock Segment.
   * Maximum length: 40.
   * @nullable
   */
  declare stockSegment?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Requirement Segment.
   * Maximum length: 40.
   * @nullable
   */
  declare requirementSegment?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-one navigation property to the {@link PurchaseOrder} entity.
   */
  declare toPurchaseOrder?: PurchaseOrder<T> | null;
  /**
   * One-to-many navigation property to the {@link PurOrdAccountAssignment} entity.
   */
  declare toAccountAssignment: PurOrdAccountAssignment<T>[];
  /**
   * One-to-many navigation property to the {@link PurchaseOrderItemNote} entity.
   */
  declare toPurchaseOrderItemNote: PurchaseOrderItemNote<T>[];
  /**
   * One-to-many navigation property to the {@link PurOrdPricingElement} entity.
   */
  declare toPurchaseOrderPricingElement: PurOrdPricingElement<T>[];
  /**
   * One-to-many navigation property to the {@link PurchaseOrderScheduleLine} entity.
   */
  declare toScheduleLine: PurchaseOrderScheduleLine<T>[];

  constructor(_entityApi: PurchaseOrderItemApi<T>) {
    super(_entityApi);
  }
}

export interface PurchaseOrderItemType<
  T extends DeSerializers = DefaultDeSerializers
> {
  purchaseOrder: DeserializedType<T, 'Edm.String'>;
  purchaseOrderItem: DeserializedType<T, 'Edm.String'>;
  purchasingDocumentDeletionCode?: DeserializedType<T, 'Edm.String'> | null;
  purchaseOrderItemText?: DeserializedType<T, 'Edm.String'> | null;
  plant?: DeserializedType<T, 'Edm.String'> | null;
  storageLocation?: DeserializedType<T, 'Edm.String'> | null;
  materialGroup?: DeserializedType<T, 'Edm.String'> | null;
  purchasingInfoRecord?: DeserializedType<T, 'Edm.String'> | null;
  supplierMaterialNumber?: DeserializedType<T, 'Edm.String'> | null;
  orderQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  purchaseOrderQuantityUnit?: DeserializedType<T, 'Edm.String'> | null;
  orderPriceUnit?: DeserializedType<T, 'Edm.String'> | null;
  orderPriceUnitToOrderUnitNmrtr?: DeserializedType<T, 'Edm.Decimal'> | null;
  ordPriceUnitToOrderUnitDnmntr?: DeserializedType<T, 'Edm.Decimal'> | null;
  documentCurrency?: DeserializedType<T, 'Edm.String'> | null;
  netPriceAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  netPriceQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  taxCode?: DeserializedType<T, 'Edm.String'> | null;
  shippingInstruction?: DeserializedType<T, 'Edm.String'> | null;
  taxDeterminationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  taxCountry?: DeserializedType<T, 'Edm.String'> | null;
  priceIsToBePrinted?: DeserializedType<T, 'Edm.Boolean'> | null;
  overdelivTolrtdLmtRatioInPct?: DeserializedType<T, 'Edm.Decimal'> | null;
  unlimitedOverdeliveryIsAllowed?: DeserializedType<T, 'Edm.Boolean'> | null;
  underdelivTolrtdLmtRatioInPct?: DeserializedType<T, 'Edm.Decimal'> | null;
  valuationType?: DeserializedType<T, 'Edm.String'> | null;
  isCompletelyDelivered?: DeserializedType<T, 'Edm.Boolean'> | null;
  isFinallyInvoiced?: DeserializedType<T, 'Edm.Boolean'> | null;
  purchaseOrderItemCategory?: DeserializedType<T, 'Edm.String'> | null;
  accountAssignmentCategory?: DeserializedType<T, 'Edm.String'> | null;
  multipleAcctAssgmtDistribution?: DeserializedType<T, 'Edm.String'> | null;
  partialInvoiceDistribution?: DeserializedType<T, 'Edm.String'> | null;
  goodsReceiptIsExpected?: DeserializedType<T, 'Edm.Boolean'> | null;
  goodsReceiptIsNonValuated?: DeserializedType<T, 'Edm.Boolean'> | null;
  invoiceIsExpected?: DeserializedType<T, 'Edm.Boolean'> | null;
  invoiceIsGoodsReceiptBased?: DeserializedType<T, 'Edm.Boolean'> | null;
  purchaseContract?: DeserializedType<T, 'Edm.String'> | null;
  purchaseContractItem?: DeserializedType<T, 'Edm.String'> | null;
  customer?: DeserializedType<T, 'Edm.String'> | null;
  subcontractor?: DeserializedType<T, 'Edm.String'> | null;
  supplierIsSubcontractor?: DeserializedType<T, 'Edm.Boolean'> | null;
  itemNetWeight?: DeserializedType<T, 'Edm.Decimal'> | null;
  itemWeightUnit?: DeserializedType<T, 'Edm.String'> | null;
  taxJurisdiction?: DeserializedType<T, 'Edm.String'> | null;
  pricingDateControl?: DeserializedType<T, 'Edm.String'> | null;
  itemVolume?: DeserializedType<T, 'Edm.Decimal'> | null;
  itemVolumeUnit?: DeserializedType<T, 'Edm.String'> | null;
  supplierConfirmationControlKey?: DeserializedType<T, 'Edm.String'> | null;
  incotermsClassification?: DeserializedType<T, 'Edm.String'> | null;
  incotermsTransferLocation?: DeserializedType<T, 'Edm.String'> | null;
  evaldRcptSettlmtIsAllowed?: DeserializedType<T, 'Edm.Boolean'> | null;
  purchaseRequisition?: DeserializedType<T, 'Edm.String'> | null;
  purchaseRequisitionItem?: DeserializedType<T, 'Edm.String'> | null;
  isReturnsItem?: DeserializedType<T, 'Edm.Boolean'> | null;
  requisitionerName?: DeserializedType<T, 'Edm.String'> | null;
  servicePackage?: DeserializedType<T, 'Edm.String'> | null;
  earmarkedFunds?: DeserializedType<T, 'Edm.String'> | null;
  earmarkedFundsDocument?: DeserializedType<T, 'Edm.String'> | null;
  earmarkedFundsItem?: DeserializedType<T, 'Edm.String'> | null;
  earmarkedFundsDocumentItem?: DeserializedType<T, 'Edm.String'> | null;
  incotermsLocation1?: DeserializedType<T, 'Edm.String'> | null;
  incotermsLocation2?: DeserializedType<T, 'Edm.String'> | null;
  material?: DeserializedType<T, 'Edm.String'> | null;
  internationalArticleNumber?: DeserializedType<T, 'Edm.String'> | null;
  manufacturerMaterial?: DeserializedType<T, 'Edm.String'> | null;
  servicePerformer?: DeserializedType<T, 'Edm.String'> | null;
  productType?: DeserializedType<T, 'Edm.String'> | null;
  expectedOverallLimitAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  overallLimitAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  purContractForOverallLimit?: DeserializedType<T, 'Edm.String'> | null;
  purchasingParentItem?: DeserializedType<T, 'Edm.String'> | null;
  purgConfigurableItemNumber?: DeserializedType<T, 'Edm.String'> | null;
  purgDocAggrgdSubitemCategory?: DeserializedType<T, 'Edm.String'> | null;
  purgDocSubitemCategory?: DeserializedType<T, 'Edm.String'> | null;
  purgExternalSortNumber?: DeserializedType<T, 'Edm.String'> | null;
  batch?: DeserializedType<T, 'Edm.String'> | null;
  purchasingItemIsFreeOfCharge?: DeserializedType<T, 'Edm.Boolean'> | null;
  referenceDeliveryAddressId?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressId?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressName?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressName2?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressFullName?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressStreetName?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressHouseNumber?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressCityName?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressPostalCode?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressRegion?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressCountry?: DeserializedType<T, 'Edm.String'> | null;
  deliveryAddressDistrictName?: DeserializedType<T, 'Edm.String'> | null;
  downPaymentType?: DeserializedType<T, 'Edm.String'> | null;
  downPaymentPercentageOfTotAmt?: DeserializedType<T, 'Edm.Decimal'> | null;
  downPaymentAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  downPaymentDueDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  brMaterialUsage?: DeserializedType<T, 'Edm.String'> | null;
  brMaterialOrigin?: DeserializedType<T, 'Edm.String'> | null;
  brCfopCategory?: DeserializedType<T, 'Edm.String'> | null;
  brIsProducedInHouse?: DeserializedType<T, 'Edm.Boolean'> | null;
  consumptionTaxCtrlCode?: DeserializedType<T, 'Edm.String'> | null;
  purgProdCmplncSupplierStatus?: DeserializedType<T, 'Edm.String'> | null;
  purgProductMarketabilityStatus?: DeserializedType<T, 'Edm.String'> | null;
  purgSafetyDataSheetStatus?: DeserializedType<T, 'Edm.String'> | null;
  purgProdCmplncDngrsGoodsStatus?: DeserializedType<T, 'Edm.String'> | null;
  stockSegment?: DeserializedType<T, 'Edm.String'> | null;
  requirementSegment?: DeserializedType<T, 'Edm.String'> | null;
  toPurchaseOrder?: PurchaseOrderType<T> | null;
  toAccountAssignment: PurOrdAccountAssignmentType<T>[];
  toPurchaseOrderItemNote: PurchaseOrderItemNoteType<T>[];
  toPurchaseOrderPricingElement: PurOrdPricingElementType<T>[];
  toScheduleLine: PurchaseOrderScheduleLineType<T>[];
}
