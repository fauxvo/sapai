/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { PurOrdPricingElement } from './PurOrdPricingElement';
import { PurOrdPricingElementRequestBuilder } from './PurOrdPricingElementRequestBuilder';
import {
  CustomField,
  defaultDeSerializers,
  DefaultDeSerializers,
  DeSerializers,
  AllFields,
  entityBuilder,
  EntityBuilderType,
  EntityApi,
  FieldBuilder,
  OrderableEdmTypeField
} from '@sap-cloud-sdk/odata-v2';
export class PurOrdPricingElementApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<PurOrdPricingElement<DeSerializersT>, DeSerializersT> {
  public deSerializers: DeSerializersT;

  private constructor(
    deSerializers: DeSerializersT = defaultDeSerializers as any
  ) {
    this.deSerializers = deSerializers;
  }

  /**
   * Do not use this method or the constructor directly.
   * Use the service function as described in the documentation to get an API instance.
   */
  public static _privateFactory<
    DeSerializersT extends DeSerializers = DefaultDeSerializers
  >(
    deSerializers: DeSerializersT = defaultDeSerializers as any
  ): PurOrdPricingElementApi<DeSerializersT> {
    return new PurOrdPricingElementApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = PurOrdPricingElement;

  requestBuilder(): PurOrdPricingElementRequestBuilder<DeSerializersT> {
    return new PurOrdPricingElementRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    PurOrdPricingElement<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<PurOrdPricingElement<DeSerializersT>, DeSerializersT>(
      this
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    PurOrdPricingElement<DeSerializersT>,
    DeSerializersT,
    NullableT
  > {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<
    typeof PurOrdPricingElement,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        PurOrdPricingElement,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    PURCHASE_ORDER: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_ORDER_ITEM: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRICING_DOCUMENT: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRICING_DOCUMENT_ITEM: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRICING_PROCEDURE_STEP: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PRICING_PROCEDURE_COUNTER: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CONDITION_TYPE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_RATE_VALUE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_CURRENCY: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PRICE_DETN_EXCHANGE_RATE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TRANSACTION_CURRENCY: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_AMOUNT: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_QUANTITY_UNIT: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_QUANTITY: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_APPLICATION: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PRICING_DATE_TIME: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_CALCULATION_TYPE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_BASE_VALUE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_TO_BASE_QTY_NMRTR: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_TO_BASE_QTY_DNMNTR: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_CATEGORY: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_IS_FOR_STATISTICS: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    PRICING_SCALE_TYPE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_RELEVANT_FOR_ACCRUAL: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CNDN_IS_RELEVANT_FOR_INVOICE_LIST: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_ORIGIN: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_GROUP_CONDITION: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CNDN_IS_RELEVANT_FOR_LIMIT_VALUE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CONDITION_SEQUENTIAL_NUMBER: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_CONTROL: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_INACTIVE_REASON: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_CLASS: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FACTOR_FOR_CONDITION_BASIS_VALUE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Double',
      true,
      true
    >;
    PRICING_SCALE_BASIS: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_SCALE_BASIS_VALUE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CONDITION_SCALE_BASIS_CURRENCY: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONDITION_SCALE_BASIS_UNIT: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CNDN_IS_RELEVANT_FOR_INTCO_BILLING: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CONDITION_IS_FOR_CONFIGURATION: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CONDITION_IS_MANUALLY_CHANGED: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CONDITION_RECORD: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ACCESS_NUMBER_OF_ACCESS_SEQUENCE: OrderableEdmTypeField<
      PurOrdPricingElement<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<PurOrdPricingElement<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link purchaseOrder} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER: fieldBuilder.buildEdmTypeField(
          'PurchaseOrder',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link purchaseOrderItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_ITEM: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderItem',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link pricingDocument} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_DOCUMENT: fieldBuilder.buildEdmTypeField(
          'PricingDocument',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link pricingDocumentItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_DOCUMENT_ITEM: fieldBuilder.buildEdmTypeField(
          'PricingDocumentItem',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link pricingProcedureStep} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_PROCEDURE_STEP: fieldBuilder.buildEdmTypeField(
          'PricingProcedureStep',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link pricingProcedureCounter} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_PROCEDURE_COUNTER: fieldBuilder.buildEdmTypeField(
          'PricingProcedureCounter',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link conditionType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_TYPE: fieldBuilder.buildEdmTypeField(
          'ConditionType',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionRateValue} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_RATE_VALUE: fieldBuilder.buildEdmTypeField(
          'ConditionRateValue',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionCurrency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_CURRENCY: fieldBuilder.buildEdmTypeField(
          'ConditionCurrency',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link priceDetnExchangeRate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICE_DETN_EXCHANGE_RATE: fieldBuilder.buildEdmTypeField(
          'PriceDetnExchangeRate',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link transactionCurrency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TRANSACTION_CURRENCY: fieldBuilder.buildEdmTypeField(
          'TransactionCurrency',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_AMOUNT: fieldBuilder.buildEdmTypeField(
          'ConditionAmount',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionQuantityUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_QUANTITY_UNIT: fieldBuilder.buildEdmTypeField(
          'ConditionQuantityUnit',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_QUANTITY: fieldBuilder.buildEdmTypeField(
          'ConditionQuantity',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionApplication} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_APPLICATION: fieldBuilder.buildEdmTypeField(
          'ConditionApplication',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link pricingDateTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_DATE_TIME: fieldBuilder.buildEdmTypeField(
          'PricingDateTime',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionCalculationType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_CALCULATION_TYPE: fieldBuilder.buildEdmTypeField(
          'ConditionCalculationType',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionBaseValue} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_BASE_VALUE: fieldBuilder.buildEdmTypeField(
          'ConditionBaseValue',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionToBaseQtyNmrtr} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_TO_BASE_QTY_NMRTR: fieldBuilder.buildEdmTypeField(
          'ConditionToBaseQtyNmrtr',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionToBaseQtyDnmntr} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_TO_BASE_QTY_DNMNTR: fieldBuilder.buildEdmTypeField(
          'ConditionToBaseQtyDnmntr',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_CATEGORY: fieldBuilder.buildEdmTypeField(
          'ConditionCategory',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionIsForStatistics} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_IS_FOR_STATISTICS: fieldBuilder.buildEdmTypeField(
          'ConditionIsForStatistics',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link pricingScaleType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_SCALE_TYPE: fieldBuilder.buildEdmTypeField(
          'PricingScaleType',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link isRelevantForAccrual} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_RELEVANT_FOR_ACCRUAL: fieldBuilder.buildEdmTypeField(
          'IsRelevantForAccrual',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link cndnIsRelevantForInvoiceList} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CNDN_IS_RELEVANT_FOR_INVOICE_LIST: fieldBuilder.buildEdmTypeField(
          'CndnIsRelevantForInvoiceList',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionOrigin} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_ORIGIN: fieldBuilder.buildEdmTypeField(
          'ConditionOrigin',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link isGroupCondition} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_GROUP_CONDITION: fieldBuilder.buildEdmTypeField(
          'IsGroupCondition',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link cndnIsRelevantForLimitValue} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CNDN_IS_RELEVANT_FOR_LIMIT_VALUE: fieldBuilder.buildEdmTypeField(
          'CndnIsRelevantForLimitValue',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link conditionSequentialNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_SEQUENTIAL_NUMBER: fieldBuilder.buildEdmTypeField(
          'ConditionSequentialNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionControl} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_CONTROL: fieldBuilder.buildEdmTypeField(
          'ConditionControl',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionInactiveReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_INACTIVE_REASON: fieldBuilder.buildEdmTypeField(
          'ConditionInactiveReason',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionClass} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_CLASS: fieldBuilder.buildEdmTypeField(
          'ConditionClass',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link factorForConditionBasisValue} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FACTOR_FOR_CONDITION_BASIS_VALUE: fieldBuilder.buildEdmTypeField(
          'FactorForConditionBasisValue',
          'Edm.Double',
          true
        ),
        /**
         * Static representation of the {@link pricingScaleBasis} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_SCALE_BASIS: fieldBuilder.buildEdmTypeField(
          'PricingScaleBasis',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionScaleBasisValue} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_SCALE_BASIS_VALUE: fieldBuilder.buildEdmTypeField(
          'ConditionScaleBasisValue',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link conditionScaleBasisCurrency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_SCALE_BASIS_CURRENCY: fieldBuilder.buildEdmTypeField(
          'ConditionScaleBasisCurrency',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link conditionScaleBasisUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_SCALE_BASIS_UNIT: fieldBuilder.buildEdmTypeField(
          'ConditionScaleBasisUnit',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link cndnIsRelevantForIntcoBilling} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CNDN_IS_RELEVANT_FOR_INTCO_BILLING: fieldBuilder.buildEdmTypeField(
          'CndnIsRelevantForIntcoBilling',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link conditionIsForConfiguration} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_IS_FOR_CONFIGURATION: fieldBuilder.buildEdmTypeField(
          'ConditionIsForConfiguration',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link conditionIsManuallyChanged} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_IS_MANUALLY_CHANGED: fieldBuilder.buildEdmTypeField(
          'ConditionIsManuallyChanged',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link conditionRecord} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONDITION_RECORD: fieldBuilder.buildEdmTypeField(
          'ConditionRecord',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link accessNumberOfAccessSequence} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ACCESS_NUMBER_OF_ACCESS_SEQUENCE: fieldBuilder.buildEdmTypeField(
          'AccessNumberOfAccessSequence',
          'Edm.String',
          true
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', PurOrdPricingElement)
      };
    }

    return this._schema;
  }
}
