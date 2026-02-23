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
import type { PurOrdAccountAssignmentApi } from './PurOrdAccountAssignmentApi';

/**
 * This class represents the entity "A_PurOrdAccountAssignment" of service "API_PURCHASEORDER_PROCESS_SRV".
 */
export class PurOrdAccountAssignment<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements PurOrdAccountAssignmentType<T>
{
  /**
   * Technical entity name for PurOrdAccountAssignment.
   */
  static override _entityName = 'A_PurOrdAccountAssignment';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath =
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
  /**
   * All key fields of the PurOrdAccountAssignment entity.
   */
  static _keys = [
    'PurchaseOrder',
    'PurchaseOrderItem',
    'AccountAssignmentNumber'
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
   * Sequential Number of Account Assignment.
   * Maximum length: 2.
   */
  declare accountAssignmentNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * Deletion Indicator: Purchasing Document Account Assignment.
   * @nullable
   */
  declare isDeleted?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Purchase Order Unit of Measure.
   * Maximum length: 3.
   * @nullable
   */
  declare purchaseOrderQuantityUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Quantity.
   * @nullable
   */
  declare quantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Distribution percentage in the case of multiple acct assgt.
   * @nullable
   */
  declare multipleAcctAssgmtDistrPercent?: DeserializedType<
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
   * Net Order Value in PO Currency.
   * @nullable
   */
  declare purgDocNetAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * G/L Account Number.
   * Maximum length: 10.
   * @nullable
   */
  declare glAccount?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Area.
   * Maximum length: 4.
   * @nullable
   */
  declare businessArea?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Cost Center.
   * Maximum length: 10.
   * @nullable
   */
  declare costCenter?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Sales and Distribution Document Number.
   * Maximum length: 10.
   * @nullable
   */
  declare salesOrder?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Sales Document Item.
   * Maximum length: 6.
   * @nullable
   */
  declare salesOrderItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Schedule Line Number.
   * Maximum length: 4.
   * @nullable
   */
  declare salesOrderScheduleLine?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Main Asset Number.
   * Maximum length: 12.
   * @nullable
   */
  declare masterFixedAsset?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Asset Subnumber.
   * Maximum length: 4.
   * @nullable
   */
  declare fixedAsset?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Goods Recipient.
   * Maximum length: 12.
   * @nullable
   */
  declare goodsRecipientName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Unloading Point.
   * Maximum length: 25.
   * @nullable
   */
  declare unloadingPointName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Controlling Area.
   * Maximum length: 4.
   * @nullable
   */
  declare controllingArea?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Cost Object.
   * Maximum length: 12.
   * @nullable
   */
  declare costObject?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Order Number.
   * Maximum length: 12.
   * @nullable
   */
  declare orderId?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Profit Center.
   * Maximum length: 10.
   * @nullable
   */
  declare profitCenter?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Work Breakdown Structure Element (WBS Element).
   * Maximum length: 24.
   * @nullable
   */
  declare wbsElementInternalId?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Work Breakdown Structure Element (WBS Element).
   * Maximum length: 24.
   * @nullable
   */
  declare wbsElement?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Work Breakdown Structure Element (WBS Element) Edited.
   * Maximum length: 24.
   * @nullable
   */
  declare wbsElementExternalId?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Network Number for Account Assignment.
   * Maximum length: 12.
   * @nullable
   */
  declare projectNetwork?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Operation/Activity Number.
   * Maximum length: 4.
   * @nullable
   */
  declare networkActivity?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Internal Key for Real Estate Object.
   * Maximum length: 40.
   * @nullable
   */
  declare realEstateObject?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Partner account number.
   * Maximum length: 10.
   * @nullable
   */
  declare partnerAccountNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Commitment Item.
   * Maximum length: 24.
   * @nullable
   */
  declare commitmentItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Recovery Indicator.
   * Maximum length: 2.
   * @nullable
   */
  declare jointVentureRecoveryCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Funds Center.
   * Maximum length: 16.
   * @nullable
   */
  declare fundsCenter?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Fund.
   * Maximum length: 10.
   * @nullable
   */
  declare fund?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Functional Area.
   * Maximum length: 16.
   * @nullable
   */
  declare functionalArea?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Reference date for settlement.
   * @nullable
   */
  declare settlementReferenceDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Tax on sales/purchases code.
   * Maximum length: 2.
   * @nullable
   */
  declare taxCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Jurisdiction.
   * Maximum length: 15.
   * @nullable
   */
  declare taxJurisdiction?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Activity Type.
   * Maximum length: 6.
   * @nullable
   */
  declare costCtrActivityType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Process.
   * Maximum length: 12.
   * @nullable
   */
  declare businessProcess?: DeserializedType<T, 'Edm.String'> | null;
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
  declare earmarkedFundsDocumentItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Grant.
   * Maximum length: 20.
   * @nullable
   */
  declare grantId?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Budget Period.
   * Maximum length: 10.
   * @nullable
   */
  declare budgetPeriod?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: PurOrdAccountAssignmentApi<T>) {
    super(_entityApi);
  }
}

export interface PurOrdAccountAssignmentType<
  T extends DeSerializers = DefaultDeSerializers
> {
  purchaseOrder: DeserializedType<T, 'Edm.String'>;
  purchaseOrderItem: DeserializedType<T, 'Edm.String'>;
  accountAssignmentNumber: DeserializedType<T, 'Edm.String'>;
  isDeleted?: DeserializedType<T, 'Edm.Boolean'> | null;
  purchaseOrderQuantityUnit?: DeserializedType<T, 'Edm.String'> | null;
  quantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  multipleAcctAssgmtDistrPercent?: DeserializedType<T, 'Edm.Decimal'> | null;
  documentCurrency?: DeserializedType<T, 'Edm.String'> | null;
  purgDocNetAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  glAccount?: DeserializedType<T, 'Edm.String'> | null;
  businessArea?: DeserializedType<T, 'Edm.String'> | null;
  costCenter?: DeserializedType<T, 'Edm.String'> | null;
  salesOrder?: DeserializedType<T, 'Edm.String'> | null;
  salesOrderItem?: DeserializedType<T, 'Edm.String'> | null;
  salesOrderScheduleLine?: DeserializedType<T, 'Edm.String'> | null;
  masterFixedAsset?: DeserializedType<T, 'Edm.String'> | null;
  fixedAsset?: DeserializedType<T, 'Edm.String'> | null;
  goodsRecipientName?: DeserializedType<T, 'Edm.String'> | null;
  unloadingPointName?: DeserializedType<T, 'Edm.String'> | null;
  controllingArea?: DeserializedType<T, 'Edm.String'> | null;
  costObject?: DeserializedType<T, 'Edm.String'> | null;
  orderId?: DeserializedType<T, 'Edm.String'> | null;
  profitCenter?: DeserializedType<T, 'Edm.String'> | null;
  wbsElementInternalId?: DeserializedType<T, 'Edm.String'> | null;
  wbsElement?: DeserializedType<T, 'Edm.String'> | null;
  wbsElementExternalId?: DeserializedType<T, 'Edm.String'> | null;
  projectNetwork?: DeserializedType<T, 'Edm.String'> | null;
  networkActivity?: DeserializedType<T, 'Edm.String'> | null;
  realEstateObject?: DeserializedType<T, 'Edm.String'> | null;
  partnerAccountNumber?: DeserializedType<T, 'Edm.String'> | null;
  commitmentItem?: DeserializedType<T, 'Edm.String'> | null;
  jointVentureRecoveryCode?: DeserializedType<T, 'Edm.String'> | null;
  fundsCenter?: DeserializedType<T, 'Edm.String'> | null;
  fund?: DeserializedType<T, 'Edm.String'> | null;
  functionalArea?: DeserializedType<T, 'Edm.String'> | null;
  settlementReferenceDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  taxCode?: DeserializedType<T, 'Edm.String'> | null;
  taxJurisdiction?: DeserializedType<T, 'Edm.String'> | null;
  costCtrActivityType?: DeserializedType<T, 'Edm.String'> | null;
  businessProcess?: DeserializedType<T, 'Edm.String'> | null;
  earmarkedFundsDocument?: DeserializedType<T, 'Edm.String'> | null;
  earmarkedFundsDocumentItem?: DeserializedType<T, 'Edm.String'> | null;
  grantId?: DeserializedType<T, 'Edm.String'> | null;
  budgetPeriod?: DeserializedType<T, 'Edm.String'> | null;
}
