/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { PurchaseOrderItem } from './PurchaseOrderItem';
import { PurchaseOrderItemRequestBuilder } from './PurchaseOrderItemRequestBuilder';
import { PurchaseOrderApi } from './PurchaseOrderApi';
import { PurOrdAccountAssignmentApi } from './PurOrdAccountAssignmentApi';
import { PurchaseOrderItemNoteApi } from './PurchaseOrderItemNoteApi';
import { PurOrdPricingElementApi } from './PurOrdPricingElementApi';
import { PurchaseOrderScheduleLineApi } from './PurchaseOrderScheduleLineApi';
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
  OneToOneLink,
  Link
} from '@sap-cloud-sdk/odata-v2';
export class PurchaseOrderItemApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<PurchaseOrderItem<DeSerializersT>, DeSerializersT> {
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
  ): PurchaseOrderItemApi<DeSerializersT> {
    return new PurchaseOrderItemApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-one navigation property {@link toPurchaseOrder} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER: OneToOneLink<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toAccountAssignment} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_ACCOUNT_ASSIGNMENT: Link<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurOrdAccountAssignmentApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPurchaseOrderItemNote} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER_ITEM_NOTE: Link<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderItemNoteApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPurchaseOrderPricingElement} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER_PRICING_ELEMENT: Link<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurOrdPricingElementApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toScheduleLine} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SCHEDULE_LINE: Link<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderScheduleLineApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      PurchaseOrderApi<DeSerializersT>,
      PurOrdAccountAssignmentApi<DeSerializersT>,
      PurchaseOrderItemNoteApi<DeSerializersT>,
      PurOrdPricingElementApi<DeSerializersT>,
      PurchaseOrderScheduleLineApi<DeSerializersT>
    ]
  ): this {
    this.navigationPropertyFields = {
      TO_PURCHASE_ORDER: new OneToOneLink(
        'to_PurchaseOrder',
        this,
        linkedApis[0]
      ),
      TO_ACCOUNT_ASSIGNMENT: new Link(
        'to_AccountAssignment',
        this,
        linkedApis[1]
      ),
      TO_PURCHASE_ORDER_ITEM_NOTE: new Link(
        'to_PurchaseOrderItemNote',
        this,
        linkedApis[2]
      ),
      TO_PURCHASE_ORDER_PRICING_ELEMENT: new Link(
        'to_PurchaseOrderPricingElement',
        this,
        linkedApis[3]
      ),
      TO_SCHEDULE_LINE: new Link('to_ScheduleLine', this, linkedApis[4])
    };
    return this;
  }

  entityConstructor = PurchaseOrderItem;

  requestBuilder(): PurchaseOrderItemRequestBuilder<DeSerializersT> {
    return new PurchaseOrderItemRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    PurchaseOrderItem<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<PurchaseOrderItem<DeSerializersT>, DeSerializersT>(
      this
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<PurchaseOrderItem<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<
    typeof PurchaseOrderItem,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        PurchaseOrderItem,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    PURCHASE_ORDER: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_ORDER_ITEM: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASING_DOCUMENT_DELETION_CODE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASE_ORDER_ITEM_TEXT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PLANT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    STORAGE_LOCATION: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    MATERIAL_GROUP: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASING_INFO_RECORD: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER_MATERIAL_NUMBER: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ORDER_QUANTITY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    PURCHASE_ORDER_QUANTITY_UNIT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ORDER_PRICE_UNIT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ORDER_PRICE_UNIT_TO_ORDER_UNIT_NMRTR: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    ORD_PRICE_UNIT_TO_ORDER_UNIT_DNMNTR: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    DOCUMENT_CURRENCY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    NET_PRICE_AMOUNT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    NET_PRICE_QUANTITY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    TAX_CODE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SHIPPING_INSTRUCTION: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_DETERMINATION_DATE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    TAX_COUNTRY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PRICE_IS_TO_BE_PRINTED: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    OVERDELIV_TOLRTD_LMT_RATIO_IN_PCT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    UNLIMITED_OVERDELIVERY_IS_ALLOWED: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    UNDERDELIV_TOLRTD_LMT_RATIO_IN_PCT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    VALUATION_TYPE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_COMPLETELY_DELIVERED: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    IS_FINALLY_INVOICED: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    PURCHASE_ORDER_ITEM_CATEGORY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ACCOUNT_ASSIGNMENT_CATEGORY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    MULTIPLE_ACCT_ASSGMT_DISTRIBUTION: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PARTIAL_INVOICE_DISTRIBUTION: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    GOODS_RECEIPT_IS_EXPECTED: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    GOODS_RECEIPT_IS_NON_VALUATED: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    INVOICE_IS_EXPECTED: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    INVOICE_IS_GOODS_RECEIPT_BASED: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    PURCHASE_CONTRACT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASE_CONTRACT_ITEM: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUBCONTRACTOR: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER_IS_SUBCONTRACTOR: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    ITEM_NET_WEIGHT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    ITEM_WEIGHT_UNIT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_JURISDICTION: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PRICING_DATE_CONTROL: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ITEM_VOLUME: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    ITEM_VOLUME_UNIT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER_CONFIRMATION_CONTROL_KEY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_CLASSIFICATION: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_TRANSFER_LOCATION: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EVALD_RCPT_SETTLMT_IS_ALLOWED: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    PURCHASE_REQUISITION: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASE_REQUISITION_ITEM: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_RETURNS_ITEM: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    REQUISITIONER_NAME: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SERVICE_PACKAGE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EARMARKED_FUNDS: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EARMARKED_FUNDS_DOCUMENT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EARMARKED_FUNDS_ITEM: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EARMARKED_FUNDS_DOCUMENT_ITEM: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_LOCATION_1: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_LOCATION_2: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    MATERIAL: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTERNATIONAL_ARTICLE_NUMBER: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    MANUFACTURER_MATERIAL: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SERVICE_PERFORMER: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PRODUCT_TYPE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EXPECTED_OVERALL_LIMIT_AMOUNT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    OVERALL_LIMIT_AMOUNT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    PUR_CONTRACT_FOR_OVERALL_LIMIT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASING_PARENT_ITEM: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_CONFIGURABLE_ITEM_NUMBER: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_DOC_AGGRGD_SUBITEM_CATEGORY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_DOC_SUBITEM_CATEGORY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_EXTERNAL_SORT_NUMBER: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BATCH: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASING_ITEM_IS_FREE_OF_CHARGE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    REFERENCE_DELIVERY_ADDRESS_ID: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_ID: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_NAME: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_NAME_2: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_FULL_NAME: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_STREET_NAME: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_HOUSE_NUMBER: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_CITY_NAME: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_POSTAL_CODE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_REGION: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_COUNTRY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_ADDRESS_DISTRICT_NAME: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DOWN_PAYMENT_TYPE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DOWN_PAYMENT_PERCENTAGE_OF_TOT_AMT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    DOWN_PAYMENT_AMOUNT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    DOWN_PAYMENT_DUE_DATE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BR_MATERIAL_USAGE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BR_MATERIAL_ORIGIN: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BR_CFOP_CATEGORY: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BR_IS_PRODUCED_IN_HOUSE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CONSUMPTION_TAX_CTRL_CODE: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_PROD_CMPLNC_SUPPLIER_STATUS: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_PRODUCT_MARKETABILITY_STATUS: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_SAFETY_DATA_SHEET_STATUS: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURG_PROD_CMPLNC_DNGRS_GOODS_STATUS: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    STOCK_SEGMENT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    REQUIREMENT_SEGMENT: OrderableEdmTypeField<
      PurchaseOrderItem<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-one navigation property {@link toPurchaseOrder} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER: OneToOneLink<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toAccountAssignment} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_ACCOUNT_ASSIGNMENT: Link<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurOrdAccountAssignmentApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPurchaseOrderItemNote} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER_ITEM_NOTE: Link<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderItemNoteApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPurchaseOrderPricingElement} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PURCHASE_ORDER_PRICING_ELEMENT: Link<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurOrdPricingElementApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toScheduleLine} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SCHEDULE_LINE: Link<
      PurchaseOrderItem<DeSerializersT>,
      DeSerializersT,
      PurchaseOrderScheduleLineApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<PurchaseOrderItem<DeSerializers>>;
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
         * Static representation of the {@link purchasingDocumentDeletionCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_DOCUMENT_DELETION_CODE: fieldBuilder.buildEdmTypeField(
          'PurchasingDocumentDeletionCode',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchaseOrderItemText} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_ITEM_TEXT: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderItemText',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link plant} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PLANT: fieldBuilder.buildEdmTypeField('Plant', 'Edm.String', true),
        /**
         * Static representation of the {@link storageLocation} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STORAGE_LOCATION: fieldBuilder.buildEdmTypeField(
          'StorageLocation',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link materialGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MATERIAL_GROUP: fieldBuilder.buildEdmTypeField(
          'MaterialGroup',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchasingInfoRecord} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_INFO_RECORD: fieldBuilder.buildEdmTypeField(
          'PurchasingInfoRecord',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link supplierMaterialNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_MATERIAL_NUMBER: fieldBuilder.buildEdmTypeField(
          'SupplierMaterialNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link orderQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDER_QUANTITY: fieldBuilder.buildEdmTypeField(
          'OrderQuantity',
          'Edm.Decimal',
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
         * Static representation of the {@link orderPriceUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDER_PRICE_UNIT: fieldBuilder.buildEdmTypeField(
          'OrderPriceUnit',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link orderPriceUnitToOrderUnitNmrtr} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDER_PRICE_UNIT_TO_ORDER_UNIT_NMRTR: fieldBuilder.buildEdmTypeField(
          'OrderPriceUnitToOrderUnitNmrtr',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link ordPriceUnitToOrderUnitDnmntr} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORD_PRICE_UNIT_TO_ORDER_UNIT_DNMNTR: fieldBuilder.buildEdmTypeField(
          'OrdPriceUnitToOrderUnitDnmntr',
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
         * Static representation of the {@link netPriceAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        NET_PRICE_AMOUNT: fieldBuilder.buildEdmTypeField(
          'NetPriceAmount',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link netPriceQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        NET_PRICE_QUANTITY: fieldBuilder.buildEdmTypeField(
          'NetPriceQuantity',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link taxCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_CODE: fieldBuilder.buildEdmTypeField('TaxCode', 'Edm.String', true),
        /**
         * Static representation of the {@link shippingInstruction} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SHIPPING_INSTRUCTION: fieldBuilder.buildEdmTypeField(
          'ShippingInstruction',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link taxDeterminationDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_DETERMINATION_DATE: fieldBuilder.buildEdmTypeField(
          'TaxDeterminationDate',
          'Edm.DateTime',
          true
        ),
        /**
         * Static representation of the {@link taxCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_COUNTRY: fieldBuilder.buildEdmTypeField(
          'TaxCountry',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link priceIsToBePrinted} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICE_IS_TO_BE_PRINTED: fieldBuilder.buildEdmTypeField(
          'PriceIsToBePrinted',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link overdelivTolrtdLmtRatioInPct} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERDELIV_TOLRTD_LMT_RATIO_IN_PCT: fieldBuilder.buildEdmTypeField(
          'OverdelivTolrtdLmtRatioInPct',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link unlimitedOverdeliveryIsAllowed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        UNLIMITED_OVERDELIVERY_IS_ALLOWED: fieldBuilder.buildEdmTypeField(
          'UnlimitedOverdeliveryIsAllowed',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link underdelivTolrtdLmtRatioInPct} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        UNDERDELIV_TOLRTD_LMT_RATIO_IN_PCT: fieldBuilder.buildEdmTypeField(
          'UnderdelivTolrtdLmtRatioInPct',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link valuationType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALUATION_TYPE: fieldBuilder.buildEdmTypeField(
          'ValuationType',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link isCompletelyDelivered} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_COMPLETELY_DELIVERED: fieldBuilder.buildEdmTypeField(
          'IsCompletelyDelivered',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link isFinallyInvoiced} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_FINALLY_INVOICED: fieldBuilder.buildEdmTypeField(
          'IsFinallyInvoiced',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link purchaseOrderItemCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_ORDER_ITEM_CATEGORY: fieldBuilder.buildEdmTypeField(
          'PurchaseOrderItemCategory',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link accountAssignmentCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ACCOUNT_ASSIGNMENT_CATEGORY: fieldBuilder.buildEdmTypeField(
          'AccountAssignmentCategory',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link multipleAcctAssgmtDistribution} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MULTIPLE_ACCT_ASSGMT_DISTRIBUTION: fieldBuilder.buildEdmTypeField(
          'MultipleAcctAssgmtDistribution',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link partialInvoiceDistribution} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PARTIAL_INVOICE_DISTRIBUTION: fieldBuilder.buildEdmTypeField(
          'PartialInvoiceDistribution',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link goodsReceiptIsExpected} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        GOODS_RECEIPT_IS_EXPECTED: fieldBuilder.buildEdmTypeField(
          'GoodsReceiptIsExpected',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link goodsReceiptIsNonValuated} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        GOODS_RECEIPT_IS_NON_VALUATED: fieldBuilder.buildEdmTypeField(
          'GoodsReceiptIsNonValuated',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link invoiceIsExpected} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INVOICE_IS_EXPECTED: fieldBuilder.buildEdmTypeField(
          'InvoiceIsExpected',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link invoiceIsGoodsReceiptBased} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INVOICE_IS_GOODS_RECEIPT_BASED: fieldBuilder.buildEdmTypeField(
          'InvoiceIsGoodsReceiptBased',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link purchaseContract} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_CONTRACT: fieldBuilder.buildEdmTypeField(
          'PurchaseContract',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchaseContractItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_CONTRACT_ITEM: fieldBuilder.buildEdmTypeField(
          'PurchaseContractItem',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link customer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER: fieldBuilder.buildEdmTypeField(
          'Customer',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link subcontractor} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUBCONTRACTOR: fieldBuilder.buildEdmTypeField(
          'Subcontractor',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link supplierIsSubcontractor} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_IS_SUBCONTRACTOR: fieldBuilder.buildEdmTypeField(
          'SupplierIsSubcontractor',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link itemNetWeight} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_NET_WEIGHT: fieldBuilder.buildEdmTypeField(
          'ItemNetWeight',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link itemWeightUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_WEIGHT_UNIT: fieldBuilder.buildEdmTypeField(
          'ItemWeightUnit',
          'Edm.String',
          true
        ),
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
         * Static representation of the {@link pricingDateControl} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICING_DATE_CONTROL: fieldBuilder.buildEdmTypeField(
          'PricingDateControl',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link itemVolume} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_VOLUME: fieldBuilder.buildEdmTypeField(
          'ItemVolume',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link itemVolumeUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_VOLUME_UNIT: fieldBuilder.buildEdmTypeField(
          'ItemVolumeUnit',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link supplierConfirmationControlKey} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_CONFIRMATION_CONTROL_KEY: fieldBuilder.buildEdmTypeField(
          'SupplierConfirmationControlKey',
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
         * Static representation of the {@link incotermsTransferLocation} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_TRANSFER_LOCATION: fieldBuilder.buildEdmTypeField(
          'IncotermsTransferLocation',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link evaldRcptSettlmtIsAllowed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EVALD_RCPT_SETTLMT_IS_ALLOWED: fieldBuilder.buildEdmTypeField(
          'EvaldRcptSettlmtIsAllowed',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link purchaseRequisition} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_REQUISITION: fieldBuilder.buildEdmTypeField(
          'PurchaseRequisition',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchaseRequisitionItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASE_REQUISITION_ITEM: fieldBuilder.buildEdmTypeField(
          'PurchaseRequisitionItem',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link isReturnsItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_RETURNS_ITEM: fieldBuilder.buildEdmTypeField(
          'IsReturnsItem',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link requisitionerName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REQUISITIONER_NAME: fieldBuilder.buildEdmTypeField(
          'RequisitionerName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link servicePackage} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SERVICE_PACKAGE: fieldBuilder.buildEdmTypeField(
          'ServicePackage',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link earmarkedFunds} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EARMARKED_FUNDS: fieldBuilder.buildEdmTypeField(
          'EarmarkedFunds',
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
         * Static representation of the {@link earmarkedFundsItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EARMARKED_FUNDS_ITEM: fieldBuilder.buildEdmTypeField(
          'EarmarkedFundsItem',
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
         * Static representation of the {@link material} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MATERIAL: fieldBuilder.buildEdmTypeField(
          'Material',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link internationalArticleNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_ARTICLE_NUMBER: fieldBuilder.buildEdmTypeField(
          'InternationalArticleNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link manufacturerMaterial} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MANUFACTURER_MATERIAL: fieldBuilder.buildEdmTypeField(
          'ManufacturerMaterial',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link servicePerformer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SERVICE_PERFORMER: fieldBuilder.buildEdmTypeField(
          'ServicePerformer',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link productType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRODUCT_TYPE: fieldBuilder.buildEdmTypeField(
          'ProductType',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link expectedOverallLimitAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EXPECTED_OVERALL_LIMIT_AMOUNT: fieldBuilder.buildEdmTypeField(
          'ExpectedOverallLimitAmount',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link overallLimitAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERALL_LIMIT_AMOUNT: fieldBuilder.buildEdmTypeField(
          'OverallLimitAmount',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link purContractForOverallLimit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PUR_CONTRACT_FOR_OVERALL_LIMIT: fieldBuilder.buildEdmTypeField(
          'PurContractForOverallLimit',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purchasingParentItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_PARENT_ITEM: fieldBuilder.buildEdmTypeField(
          'PurchasingParentItem',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgConfigurableItemNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_CONFIGURABLE_ITEM_NUMBER: fieldBuilder.buildEdmTypeField(
          'PurgConfigurableItemNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgDocAggrgdSubitemCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_DOC_AGGRGD_SUBITEM_CATEGORY: fieldBuilder.buildEdmTypeField(
          'PurgDocAggrgdSubitemCategory',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgDocSubitemCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_DOC_SUBITEM_CATEGORY: fieldBuilder.buildEdmTypeField(
          'PurgDocSubitemCategory',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgExternalSortNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_EXTERNAL_SORT_NUMBER: fieldBuilder.buildEdmTypeField(
          'PurgExternalSortNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link batch} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BATCH: fieldBuilder.buildEdmTypeField('Batch', 'Edm.String', true),
        /**
         * Static representation of the {@link purchasingItemIsFreeOfCharge} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_ITEM_IS_FREE_OF_CHARGE: fieldBuilder.buildEdmTypeField(
          'PurchasingItemIsFreeOfCharge',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link referenceDeliveryAddressId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REFERENCE_DELIVERY_ADDRESS_ID: fieldBuilder.buildEdmTypeField(
          'ReferenceDeliveryAddressID',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_ID: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressID',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_NAME: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressName2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_NAME_2: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressName2',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressFullName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_FULL_NAME: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressFullName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressStreetName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_STREET_NAME: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressStreetName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressHouseNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_HOUSE_NUMBER: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressHouseNumber',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressCityName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_CITY_NAME: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressCityName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressPostalCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_POSTAL_CODE: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressPostalCode',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressRegion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_REGION: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressRegion',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_COUNTRY: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressCountry',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deliveryAddressDistrictName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_ADDRESS_DISTRICT_NAME: fieldBuilder.buildEdmTypeField(
          'DeliveryAddressDistrictName',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link downPaymentType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DOWN_PAYMENT_TYPE: fieldBuilder.buildEdmTypeField(
          'DownPaymentType',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link downPaymentPercentageOfTotAmt} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DOWN_PAYMENT_PERCENTAGE_OF_TOT_AMT: fieldBuilder.buildEdmTypeField(
          'DownPaymentPercentageOfTotAmt',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link downPaymentAmount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DOWN_PAYMENT_AMOUNT: fieldBuilder.buildEdmTypeField(
          'DownPaymentAmount',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link downPaymentDueDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DOWN_PAYMENT_DUE_DATE: fieldBuilder.buildEdmTypeField(
          'DownPaymentDueDate',
          'Edm.DateTime',
          true
        ),
        /**
         * Static representation of the {@link brMaterialUsage} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BR_MATERIAL_USAGE: fieldBuilder.buildEdmTypeField(
          'BR_MaterialUsage',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link brMaterialOrigin} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BR_MATERIAL_ORIGIN: fieldBuilder.buildEdmTypeField(
          'BR_MaterialOrigin',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link brCfopCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BR_CFOP_CATEGORY: fieldBuilder.buildEdmTypeField(
          'BR_CFOPCategory',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link brIsProducedInHouse} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BR_IS_PRODUCED_IN_HOUSE: fieldBuilder.buildEdmTypeField(
          'BR_IsProducedInHouse',
          'Edm.Boolean',
          true
        ),
        /**
         * Static representation of the {@link consumptionTaxCtrlCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONSUMPTION_TAX_CTRL_CODE: fieldBuilder.buildEdmTypeField(
          'ConsumptionTaxCtrlCode',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgProdCmplncSupplierStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_PROD_CMPLNC_SUPPLIER_STATUS: fieldBuilder.buildEdmTypeField(
          'PurgProdCmplncSupplierStatus',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgProductMarketabilityStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_PRODUCT_MARKETABILITY_STATUS: fieldBuilder.buildEdmTypeField(
          'PurgProductMarketabilityStatus',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgSafetyDataSheetStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_SAFETY_DATA_SHEET_STATUS: fieldBuilder.buildEdmTypeField(
          'PurgSafetyDataSheetStatus',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link purgProdCmplncDngrsGoodsStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURG_PROD_CMPLNC_DNGRS_GOODS_STATUS: fieldBuilder.buildEdmTypeField(
          'PurgProdCmplncDngrsGoodsStatus',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link stockSegment} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STOCK_SEGMENT: fieldBuilder.buildEdmTypeField(
          'StockSegment',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link requirementSegment} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REQUIREMENT_SEGMENT: fieldBuilder.buildEdmTypeField(
          'RequirementSegment',
          'Edm.String',
          true
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', PurchaseOrderItem)
      };
    }

    return this._schema;
  }
}
