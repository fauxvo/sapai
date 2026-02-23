/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { PurOrdAccountAssignment } from './PurOrdAccountAssignment';
import { PurOrdAccountAssignmentRequestBuilder } from './PurOrdAccountAssignmentRequestBuilder';
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
export class PurOrdAccountAssignmentApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<
  PurOrdAccountAssignment<DeSerializersT>,
  DeSerializersT
> {
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
  ): PurOrdAccountAssignmentApi<DeSerializersT> {
    return new PurOrdAccountAssignmentApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = PurOrdAccountAssignment;

  requestBuilder(): PurOrdAccountAssignmentRequestBuilder<DeSerializersT> {
    return new PurOrdAccountAssignmentRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    PurOrdAccountAssignment<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      PurOrdAccountAssignment<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    PurOrdAccountAssignment<DeSerializersT>,
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
    typeof PurOrdAccountAssignment,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        PurOrdAccountAssignment,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    PURCHASE_ORDER: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_ORDER_ITEM: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ACCOUNT_ASSIGNMENT_NUMBER: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    IS_DELETED: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    PURCHASE_ORDER_QUANTITY_UNIT: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    QUANTITY: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    MULTIPLE_ACCT_ASSGMT_DISTR_PERCENT: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    DOCUMENT_CURRENCY: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_DOC_NET_AMOUNT: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    GL_ACCOUNT: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_AREA: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COST_CENTER: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SALES_ORDER: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SALES_ORDER_ITEM: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SALES_ORDER_SCHEDULE_LINE: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    MASTER_FIXED_ASSET: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FIXED_ASSET: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    GOODS_RECIPIENT_NAME: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    UNLOADING_POINT_NAME: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONTROLLING_AREA: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COST_OBJECT: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ORDER_ID: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PROFIT_CENTER: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WBS_ELEMENT_INTERNAL_ID: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WBS_ELEMENT: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WBS_ELEMENT_EXTERNAL_ID: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PROJECT_NETWORK: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    NETWORK_ACTIVITY: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    REAL_ESTATE_OBJECT: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PARTNER_ACCOUNT_NUMBER: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COMMITMENT_ITEM: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    JOINT_VENTURE_RECOVERY_CODE: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FUNDS_CENTER: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FUND: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FUNCTIONAL_AREA: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SETTLEMENT_REFERENCE_DATE: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    TAX_CODE: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_JURISDICTION: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COST_CTR_ACTIVITY_TYPE: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PROCESS: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EARMARKED_FUNDS_DOCUMENT: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EARMARKED_FUNDS_DOCUMENT_ITEM: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    GRANT_ID: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUDGET_PERIOD: OrderableEdmTypeField<
      PurOrdAccountAssignment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<PurOrdAccountAssignment<DeSerializers>>;
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
         * Static representation of the {@link accountAssignmentNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ACCOUNT_ASSIGNMENT_NUMBER: fieldBuilder.buildEdmTypeField(
          'AccountAssignmentNumber',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link isDeleted} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_DELETED: fieldBuilder.buildEdmTypeField(
          'IsDeleted',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link purchaseOrderQuantityUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_QUANTITY_UNIT: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderQuantityUnit',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link quantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        QUANTITY: fieldBuilder.buildEdmTypeField(
          'Quantity',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link multipleAcctAssgmtDistrPercent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MULTIPLE_ACCT_ASSGMT_DISTR_PERCENT: fieldBuilder.buildEdmTypeField(
          'MultipleAcctAssgmtDistrPercent',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link documentCurrency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DOCUMENT_CURRENCY: fieldBuilder.buildEdmTypeField(
          'DocumentCurrency',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgDocNetAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_DOC_NET_AMOUNT: fieldBuilder.buildEdmTypeField(
          'PurgDocNetAmount',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link glAccount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        GL_ACCOUNT: fieldBuilder.buildEdmTypeField(
          'GLAccount',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link businessArea} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_AREA: fieldBuilder.buildEdmTypeField(
          'BusinessArea',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link costCenter} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COST_CENTER: fieldBuilder.buildEdmTypeField(
          'CostCenter',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link salesOrder} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER: fieldBuilder.buildEdmTypeField(
          'SalesOrder',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link salesOrderItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_ITEM: fieldBuilder.buildEdmTypeField(
          'SalesOrderItem',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link salesOrderScheduleLine} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORDER_SCHEDULE_LINE: fieldBuilder.buildEdmTypeField(
          'SalesOrderScheduleLine',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link masterFixedAsset} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MASTER_FIXED_ASSET: fieldBuilder.buildEdmTypeField(
          'MasterFixedAsset',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link fixedAsset} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FIXED_ASSET: fieldBuilder.buildEdmTypeField(
          'FixedAsset',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link goodsRecipientName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        GOODS_RECIPIENT_NAME: fieldBuilder.buildEdmTypeField(
          'GoodsRecipientName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link unloadingPointName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        UNLOADING_POINT_NAME: fieldBuilder.buildEdmTypeField(
          'UnloadingPointName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link controllingArea} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTROLLING_AREA: fieldBuilder.buildEdmTypeField(
          'ControllingArea',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link costObject} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COST_OBJECT: fieldBuilder.buildEdmTypeField(
          'CostObject',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link orderId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDER_ID: fieldBuilder.buildEdmTypeField('OrderID', 'Edm.String', true),
        /**
         * Static representation of the {@link profitCenter} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PROFIT_CENTER: fieldBuilder.buildEdmTypeField(
          'ProfitCenter',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link wbsElementInternalId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WBS_ELEMENT_INTERNAL_ID: fieldBuilder.buildEdmTypeField(
          'WBSElementInternalID',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link wbsElement} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WBS_ELEMENT: fieldBuilder.buildEdmTypeField(
          'WBSElement',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link wbsElementExternalId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WBS_ELEMENT_EXTERNAL_ID: fieldBuilder.buildEdmTypeField(
          'WBSElementExternalID',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link projectNetwork} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PROJECT_NETWORK: fieldBuilder.buildEdmTypeField(
          'ProjectNetwork',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link networkActivity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        NETWORK_ACTIVITY: fieldBuilder.buildEdmTypeField(
          'NetworkActivity',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link realEstateObject} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REAL_ESTATE_OBJECT: fieldBuilder.buildEdmTypeField(
          'RealEstateObject',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link partnerAccountNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PARTNER_ACCOUNT_NUMBER: fieldBuilder.buildEdmTypeField(
          'PartnerAccountNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link commitmentItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COMMITMENT_ITEM: fieldBuilder.buildEdmTypeField(
          'CommitmentItem',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link jointVentureRecoveryCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        JOINT_VENTURE_RECOVERY_CODE: fieldBuilder.buildEdmTypeField(
          'JointVentureRecoveryCode',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link fundsCenter} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FUNDS_CENTER: fieldBuilder.buildEdmTypeField(
          'FundsCenter',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link fund} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FUND: fieldBuilder.buildEdmTypeField('Fund', 'Edm.String', true),
        /**
         * Static representation of the {@link functionalArea} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FUNCTIONAL_AREA: fieldBuilder.buildEdmTypeField(
          'FunctionalArea',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link settlementReferenceDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SETTLEMENT_REFERENCE_DATE: fieldBuilder.buildEdmTypeField(
          'SettlementReferenceDate',
          'Edm.DateTime',
          true
        ),
        /**
         * Static representation of the {@link taxCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_CODE: fieldBuilder.buildEdmTypeField('TaxCode', 'Edm.String', true),
        /**
         * Static representation of the {@link taxJurisdiction} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_JURISDICTION: fieldBuilder.buildEdmTypeField(
          'TaxJurisdiction',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link costCtrActivityType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COST_CTR_ACTIVITY_TYPE: fieldBuilder.buildEdmTypeField(
          'CostCtrActivityType',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link businessProcess} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PROCESS: fieldBuilder.buildEdmTypeField(
          'BusinessProcess',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link earmarkedFundsDocument} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EARMARKED_FUNDS_DOCUMENT: fieldBuilder.buildEdmTypeField(
          'EarmarkedFundsDocument',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link earmarkedFundsDocumentItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EARMARKED_FUNDS_DOCUMENT_ITEM: fieldBuilder.buildEdmTypeField(
          'EarmarkedFundsDocumentItem',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link grantId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        GRANT_ID: fieldBuilder.buildEdmTypeField('GrantID', 'Edm.String', true),
        /**
         * Static representation of the {@link budgetPeriod} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUDGET_PERIOD: fieldBuilder.buildEdmTypeField(
          'BudgetPeriod',
          'Edm.String',
          true
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', PurOrdAccountAssignment)
      };
    }

    return this._schema;
  }
}
