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
import type { PurOrdPricingElementApi } from './PurOrdPricingElementApi';

/**
 * This class represents the entity "A_PurOrdPricingElement" of service "API_PURCHASEORDER_PROCESS_SRV".
 */
export class PurOrdPricingElement<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements PurOrdPricingElementType<T>
{
  /**
   * Technical entity name for PurOrdPricingElement.
   */
  static override _entityName = 'A_PurOrdPricingElement';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath =
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
  /**
   * All key fields of the PurOrdPricingElement entity.
   */
  static _keys = [
    'PurchaseOrder',
    'PurchaseOrderItem',
    'PricingDocument',
    'PricingDocumentItem',
    'PricingProcedureStep',
    'PricingProcedureCounter'
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
   * Number of the Document Condition.
   * Maximum length: 10.
   */
  declare pricingDocument: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition item number.
   * Maximum length: 6.
   */
  declare pricingDocumentItem: DeserializedType<T, 'Edm.String'>;
  /**
   * Step Number.
   * Maximum length: 3.
   */
  declare pricingProcedureStep: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Counter.
   * Maximum length: 3.
   */
  declare pricingProcedureCounter: DeserializedType<T, 'Edm.String'>;
  /**
   * Condition Type.
   * Maximum length: 4.
   * @nullable
   */
  declare conditionType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition Amount or Percentage.
   * @nullable
   */
  declare conditionRateValue?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Currency Key.
   * Maximum length: 5.
   * @nullable
   */
  declare conditionCurrency?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Price Detn Exchange Rate.
   * Maximum length: 12.
   * @nullable
   */
  declare priceDetnExchangeRate?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * SD Document Currency.
   * Maximum length: 5.
   * @nullable
   */
  declare transactionCurrency?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition Value.
   * @nullable
   */
  declare conditionAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Condition Unit in the Document.
   * Maximum length: 3.
   * @nullable
   */
  declare conditionQuantityUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition Pricing Unit.
   * @nullable
   */
  declare conditionQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Application.
   * Maximum length: 2.
   * @nullable
   */
  declare conditionApplication?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Timestamp for Pricing.
   * Maximum length: 14.
   * @nullable
   */
  declare pricingDateTime?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Calculation Type for Condition.
   * Maximum length: 3.
   * @nullable
   */
  declare conditionCalculationType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition Basis.
   * @nullable
   */
  declare conditionBaseValue?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Numerator for Converting to Base UoM.
   * @nullable
   */
  declare conditionToBaseQtyNmrtr?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Denominator for Converting to Base UoM.
   * @nullable
   */
  declare conditionToBaseQtyDnmntr?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Condition Category (Examples: Tax, Freight, Price, Cost).
   * Maximum length: 1.
   * @nullable
   */
  declare conditionCategory?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition is used for statistics.
   * @nullable
   */
  declare conditionIsForStatistics?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Scale Type.
   * Maximum length: 1.
   * @nullable
   */
  declare pricingScaleType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition is Relevant for Accrual  (e.g. Freight).
   * @nullable
   */
  declare isRelevantForAccrual?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Condition for Invoice List.
   * Maximum length: 1.
   * @nullable
   */
  declare cndnIsRelevantForInvoiceList?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Origin of the Condition.
   * Maximum length: 1.
   * @nullable
   */
  declare conditionOrigin?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Group Condition.
   * Maximum length: 1.
   * @nullable
   */
  declare isGroupCondition?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition Update.
   * @nullable
   */
  declare cndnIsRelevantForLimitValue?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Sequential Number of the Condition.
   * Maximum length: 3.
   * @nullable
   */
  declare conditionSequentialNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition Control.
   * Maximum length: 1.
   * @nullable
   */
  declare conditionControl?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition is Inactive.
   * Maximum length: 1.
   * @nullable
   */
  declare conditionInactiveReason?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition Class.
   * Maximum length: 1.
   * @nullable
   */
  declare conditionClass?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Factor for Condition Base Value.
   * @nullable
   */
  declare factorForConditionBasisValue?: DeserializedType<
    T,
    'Edm.Double'
  > | null;
  /**
   * Scale Basis Indicator.
   * Maximum length: 3.
   * @nullable
   */
  declare pricingScaleBasis?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Scale Base Value.
   * @nullable
   */
  declare conditionScaleBasisValue?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Scale Currency.
   * Maximum length: 5.
   * @nullable
   */
  declare conditionScaleBasisCurrency?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Condition Scale Unit of Measure.
   * Maximum length: 3.
   * @nullable
   */
  declare conditionScaleBasisUnit?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Condition for Intercompany Billing.
   * @nullable
   */
  declare cndnIsRelevantForIntcoBilling?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Condition Used for Variant Configuration.
   * @nullable
   */
  declare conditionIsForConfiguration?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Condition Changed Manually.
   * @nullable
   */
  declare conditionIsManuallyChanged?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Number of Condition Record.
   * Maximum length: 10.
   * @nullable
   */
  declare conditionRecord?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Access sequence - Access number.
   * Maximum length: 3.
   * @nullable
   */
  declare accessNumberOfAccessSequence?: DeserializedType<
    T,
    'Edm.String'
  > | null;

  constructor(_entityApi: PurOrdPricingElementApi<T>) {
    super(_entityApi);
  }
}

export interface PurOrdPricingElementType<
  T extends DeSerializers = DefaultDeSerializers
> {
  purchaseOrder: DeserializedType<T, 'Edm.String'>;
  purchaseOrderItem: DeserializedType<T, 'Edm.String'>;
  pricingDocument: DeserializedType<T, 'Edm.String'>;
  pricingDocumentItem: DeserializedType<T, 'Edm.String'>;
  pricingProcedureStep: DeserializedType<T, 'Edm.String'>;
  pricingProcedureCounter: DeserializedType<T, 'Edm.String'>;
  conditionType?: DeserializedType<T, 'Edm.String'> | null;
  conditionRateValue?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionCurrency?: DeserializedType<T, 'Edm.String'> | null;
  priceDetnExchangeRate?: DeserializedType<T, 'Edm.String'> | null;
  transactionCurrency?: DeserializedType<T, 'Edm.String'> | null;
  conditionAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionQuantityUnit?: DeserializedType<T, 'Edm.String'> | null;
  conditionQuantity?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionApplication?: DeserializedType<T, 'Edm.String'> | null;
  pricingDateTime?: DeserializedType<T, 'Edm.String'> | null;
  conditionCalculationType?: DeserializedType<T, 'Edm.String'> | null;
  conditionBaseValue?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionToBaseQtyNmrtr?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionToBaseQtyDnmntr?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionCategory?: DeserializedType<T, 'Edm.String'> | null;
  conditionIsForStatistics?: DeserializedType<T, 'Edm.Boolean'> | null;
  pricingScaleType?: DeserializedType<T, 'Edm.String'> | null;
  isRelevantForAccrual?: DeserializedType<T, 'Edm.Boolean'> | null;
  cndnIsRelevantForInvoiceList?: DeserializedType<T, 'Edm.String'> | null;
  conditionOrigin?: DeserializedType<T, 'Edm.String'> | null;
  isGroupCondition?: DeserializedType<T, 'Edm.String'> | null;
  cndnIsRelevantForLimitValue?: DeserializedType<T, 'Edm.Boolean'> | null;
  conditionSequentialNumber?: DeserializedType<T, 'Edm.String'> | null;
  conditionControl?: DeserializedType<T, 'Edm.String'> | null;
  conditionInactiveReason?: DeserializedType<T, 'Edm.String'> | null;
  conditionClass?: DeserializedType<T, 'Edm.String'> | null;
  factorForConditionBasisValue?: DeserializedType<T, 'Edm.Double'> | null;
  pricingScaleBasis?: DeserializedType<T, 'Edm.String'> | null;
  conditionScaleBasisValue?: DeserializedType<T, 'Edm.Decimal'> | null;
  conditionScaleBasisCurrency?: DeserializedType<T, 'Edm.String'> | null;
  conditionScaleBasisUnit?: DeserializedType<T, 'Edm.String'> | null;
  cndnIsRelevantForIntcoBilling?: DeserializedType<T, 'Edm.Boolean'> | null;
  conditionIsForConfiguration?: DeserializedType<T, 'Edm.Boolean'> | null;
  conditionIsManuallyChanged?: DeserializedType<T, 'Edm.Boolean'> | null;
  conditionRecord?: DeserializedType<T, 'Edm.String'> | null;
  accessNumberOfAccessSequence?: DeserializedType<T, 'Edm.String'> | null;
}
