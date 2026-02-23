/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { PurchaseOrder } from './PurchaseOrder';
import { PurchaseOrderRequestBuilder } from './PurchaseOrderRequestBuilder';
import { PurchaseOrderItemApi } from './PurchaseOrderItemApi';
import { PurchaseOrderNoteApi } from './PurchaseOrderNoteApi';
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
  OrderableEdmTypeField,
  Link
} from '@sap-cloud-sdk/odata-v2';
export class PurchaseOrderApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<PurchaseOrder<DeSerializersT>, DeSerializersT> {
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
  ): PurchaseOrderApi<DeSerializersT> {
    return new PurchaseOrderApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link toPurchaseOrderItem} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER_ITEM: Link<
      PurchaseOrder<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderItemApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPurchaseOrderNote} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER_NOTE: Link<
      PurchaseOrder<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderNoteApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      PurchaseOrderItemApi<DeSerializersT>,
      PurchaseOrderNoteApi<DeSerializersT>
    ]
  ): this {
    this.navigationPropertyFields = {
      TO_PURCHASE_ORDER_ITEM: new Link(
        'to_PurchaseOrderItem',
        this,
        linkedApis[0]
      ),
      TO_PURCHASE_ORDER_NOTE: new Link(
        'to_PurchaseOrderNote',
        this,
        linkedApis[1]
      )
    };
    return this;
  }

  entityConstructor = PurchaseOrder;

  requestBuilder(): PurchaseOrderRequestBuilder<DeSerializersT> {
    return new PurchaseOrderRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    PurchaseOrder<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<PurchaseOrder<DeSerializersT>, DeSerializersT>(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<PurchaseOrder<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof PurchaseOrder, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(PurchaseOrder, this.deSerializers);
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    PURCHASE_ORDER: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    COMPANY_CODE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASE_ORDER_TYPE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASING_DOCUMENT_DELETION_CODE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASING_PROCESSING_STATUS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CREATED_BY_USER: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CREATION_DATE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    LAST_CHANGE_DATE_TIME: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.DateTimeOffset',
      true,
      true
    >;
    SUPPLIER: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASE_ORDER_SUBTYPE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    LANGUAGE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYMENT_TERMS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CASH_DISCOUNT_1_DAYS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CASH_DISCOUNT_2_DAYS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    NET_PAYMENT_DAYS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CASH_DISCOUNT_1_PERCENT: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CASH_DISCOUNT_2_PERCENT: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    PURCHASING_ORGANIZATION: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASING_DOCUMENT_ORIGIN: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASING_GROUP: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASE_ORDER_DATE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    DOCUMENT_CURRENCY: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EXCHANGE_RATE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EXCHANGE_RATE_IS_FIXED: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    VALIDITY_START_DATE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    VALIDITY_END_DATE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    SUPPLIER_QUOTATION_EXTERNAL_ID: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASING_COLLECTIVE_NUMBER: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER_RESP_SALES_PERSON_NAME: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER_PHONE_NUMBER: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLYING_SUPPLIER: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLYING_PLANT: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_CLASSIFICATION: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CORRESPNC_EXTERNAL_REFERENCE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CORRESPNC_INTERNAL_REFERENCE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INVOICING_PARTY: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    RELEASE_IS_NOT_COMPLETED: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    PURCHASING_COMPLETENESS_STATUS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    INCOTERMS_VERSION: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_LOCATION_1: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_LOCATION_2: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    MANUAL_SUPPLIER_ADDRESS_ID: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_END_OF_PURPOSE_BLOCKED: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_CITY_NAME: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_FAX_NUMBER: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_HOUSE_NUMBER: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_NAME: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_POSTAL_CODE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_STREET_NAME: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_PHONE_NUMBER: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_REGION: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_COUNTRY: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_CORRESPONDENCE_LANGUAGE: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_AGGRGD_PROD_CMPLNC_SUPLR_STS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_AGGRGD_PROD_MARKETABILITY_STS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_AGGRGD_SFTY_DATA_SHEET_STATUS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_PROD_CMPLNC_TOT_DNGRS_GOODS_STS: OrderableEdmTypeField<
      PurchaseOrder<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPurchaseOrderItem} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER_ITEM: Link<
      PurchaseOrder<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderItemApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPurchaseOrderNote} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER_NOTE: Link<
      PurchaseOrder<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderNoteApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<PurchaseOrder<DeSerializers>>;
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
         * Static representation of the {@link companyCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COMPANY_CODE: fieldBuilder.buildEdmTypeField(
          'CompanyCode',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchaseOrderType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_TYPE: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderType',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchasingDocumentDeletionCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_DOCUMENT_DELETION_CODE: fieldBuilder.buildEdmTypeField(
          'PurchasingDocumentDeletionCode',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchasingProcessingStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_PROCESSING_STATUS: fieldBuilder.buildEdmTypeField(
          'PurchasingProcessingStatus',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link createdByUser} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATED_BY_USER: fieldBuilder.buildEdmTypeField(
          'CreatedByUser',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link creationDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATION_DATE: fieldBuilder.buildEdmTypeField(
          'CreationDate',
          'Edm.DateTime',
          true
        ),
        /**
         * Static representation of the {@link lastChangeDateTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LAST_CHANGE_DATE_TIME: fieldBuilder.buildEdmTypeField(
          'LastChangeDateTime',
          'Edm.DateTimeOffset',
          true
        ),
        /**
         * Static representation of the {@link supplier} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER: fieldBuilder.buildEdmTypeField(
          'Supplier',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchaseOrderSubtype} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_SUBTYPE: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderSubtype',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link language} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LANGUAGE: fieldBuilder.buildEdmTypeField(
          'Language',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link paymentTerms} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_TERMS: fieldBuilder.buildEdmTypeField(
          'PaymentTerms',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link cashDiscount1Days} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CASH_DISCOUNT_1_DAYS: fieldBuilder.buildEdmTypeField(
          'CashDiscount1Days',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link cashDiscount2Days} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CASH_DISCOUNT_2_DAYS: fieldBuilder.buildEdmTypeField(
          'CashDiscount2Days',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link netPaymentDays} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        NET_PAYMENT_DAYS: fieldBuilder.buildEdmTypeField(
          'NetPaymentDays',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link cashDiscount1Percent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CASH_DISCOUNT_1_PERCENT: fieldBuilder.buildEdmTypeField(
          'CashDiscount1Percent',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link cashDiscount2Percent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CASH_DISCOUNT_2_PERCENT: fieldBuilder.buildEdmTypeField(
          'CashDiscount2Percent',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link purchasingOrganization} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_ORGANIZATION: fieldBuilder.buildEdmTypeField(
          'PurchasingOrganization',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchasingDocumentOrigin} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_DOCUMENT_ORIGIN: fieldBuilder.buildEdmTypeField(
          'PurchasingDocumentOrigin',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchasingGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_GROUP: fieldBuilder.buildEdmTypeField(
          'PurchasingGroup',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchaseOrderDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_DATE: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderDate',
          'Edm.DateTime',
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
         * Static representation of the {@link exchangeRate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EXCHANGE_RATE: fieldBuilder.buildEdmTypeField(
          'ExchangeRate',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link exchangeRateIsFixed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EXCHANGE_RATE_IS_FIXED: fieldBuilder.buildEdmTypeField(
          'ExchangeRateIsFixed',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link validityStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_START_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityStartDate',
          'Edm.DateTime',
          true
        ),
        /**
         * Static representation of the {@link validityEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_END_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityEndDate',
          'Edm.DateTime',
          true
        ),
        /**
         * Static representation of the {@link supplierQuotationExternalId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_QUOTATION_EXTERNAL_ID: fieldBuilder.buildEdmTypeField(
          'SupplierQuotationExternalID',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchasingCollectiveNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_COLLECTIVE_NUMBER: fieldBuilder.buildEdmTypeField(
          'PurchasingCollectiveNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link supplierRespSalesPersonName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_RESP_SALES_PERSON_NAME: fieldBuilder.buildEdmTypeField(
          'SupplierRespSalesPersonName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link supplierPhoneNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_PHONE_NUMBER: fieldBuilder.buildEdmTypeField(
          'SupplierPhoneNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link supplyingSupplier} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLYING_SUPPLIER: fieldBuilder.buildEdmTypeField(
          'SupplyingSupplier',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link supplyingPlant} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLYING_PLANT: fieldBuilder.buildEdmTypeField(
          'SupplyingPlant',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link incotermsClassification} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_CLASSIFICATION: fieldBuilder.buildEdmTypeField(
          'IncotermsClassification',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link correspncExternalReference} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CORRESPNC_EXTERNAL_REFERENCE: fieldBuilder.buildEdmTypeField(
          'CorrespncExternalReference',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link correspncInternalReference} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CORRESPNC_INTERNAL_REFERENCE: fieldBuilder.buildEdmTypeField(
          'CorrespncInternalReference',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link invoicingParty} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INVOICING_PARTY: fieldBuilder.buildEdmTypeField(
          'InvoicingParty',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link releaseIsNotCompleted} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RELEASE_IS_NOT_COMPLETED: fieldBuilder.buildEdmTypeField(
          'ReleaseIsNotCompleted',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link purchasingCompletenessStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_COMPLETENESS_STATUS: fieldBuilder.buildEdmTypeField(
          'PurchasingCompletenessStatus',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link incotermsVersion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_VERSION: fieldBuilder.buildEdmTypeField(
          'IncotermsVersion',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link incotermsLocation1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_LOCATION_1: fieldBuilder.buildEdmTypeField(
          'IncotermsLocation1',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link incotermsLocation2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_LOCATION_2: fieldBuilder.buildEdmTypeField(
          'IncotermsLocation2',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link manualSupplierAddressId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MANUAL_SUPPLIER_ADDRESS_ID: fieldBuilder.buildEdmTypeField(
          'ManualSupplierAddressID',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link isEndOfPurposeBlocked} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_END_OF_PURPOSE_BLOCKED: fieldBuilder.buildEdmTypeField(
          'IsEndOfPurposeBlocked',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressCityName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_CITY_NAME: fieldBuilder.buildEdmTypeField(
          'AddressCityName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressFaxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_FAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'AddressFaxNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressHouseNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_HOUSE_NUMBER: fieldBuilder.buildEdmTypeField(
          'AddressHouseNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_NAME: fieldBuilder.buildEdmTypeField(
          'AddressName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressPostalCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_POSTAL_CODE: fieldBuilder.buildEdmTypeField(
          'AddressPostalCode',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressStreetName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_STREET_NAME: fieldBuilder.buildEdmTypeField(
          'AddressStreetName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressPhoneNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_PHONE_NUMBER: fieldBuilder.buildEdmTypeField(
          'AddressPhoneNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressRegion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_REGION: fieldBuilder.buildEdmTypeField(
          'AddressRegion',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_COUNTRY: fieldBuilder.buildEdmTypeField(
          'AddressCountry',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link addressCorrespondenceLanguage} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_CORRESPONDENCE_LANGUAGE: fieldBuilder.buildEdmTypeField(
          'AddressCorrespondenceLanguage',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgAggrgdProdCmplncSuplrSts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_AGGRGD_PROD_CMPLNC_SUPLR_STS: fieldBuilder.buildEdmTypeField(
          'PurgAggrgdProdCmplncSuplrSts',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgAggrgdProdMarketabilitySts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_AGGRGD_PROD_MARKETABILITY_STS: fieldBuilder.buildEdmTypeField(
          'PurgAggrgdProdMarketabilitySts',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgAggrgdSftyDataSheetStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_AGGRGD_SFTY_DATA_SHEET_STATUS: fieldBuilder.buildEdmTypeField(
          'PurgAggrgdSftyDataSheetStatus',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgProdCmplncTotDngrsGoodsSts} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_PROD_CMPLNC_TOT_DNGRS_GOODS_STS: fieldBuilder.buildEdmTypeField(
          'PurgProdCmplncTotDngrsGoodsSts',
          'Edm.String',
          true
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', PurchaseOrder)
      };
    }

    return this._schema;
  }
}
