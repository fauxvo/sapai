/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { PurchaseOrderScheduleLine } from './PurchaseOrderScheduleLine';
import { PurchaseOrderScheduleLineRequestBuilder } from './PurchaseOrderScheduleLineRequestBuilder';
import { PoSubcontractingComponentApi } from './PoSubcontractingComponentApi';
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
  Time,
  OrderableEdmTypeField,
  Link
} from '@sap-cloud-sdk/odata-v2';
export class PurchaseOrderScheduleLineApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<
  PurchaseOrderScheduleLine<DeSerializersT>,
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
  ): PurchaseOrderScheduleLineApi<DeSerializersT> {
    return new PurchaseOrderScheduleLineApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link toSubcontractingComponent} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SUBCONTRACTING_COMPONENT: Link<
      PurchaseOrderScheduleLine<DeSerializersT>,
      DeSerializersT,
      PoSubcontractingComponentApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [PoSubcontractingComponentApi<DeSerializersT>]
  ): this {
    this.navigationPropertyFields = {
      TO_SUBCONTRACTING_COMPONENT: new Link(
        'to_SubcontractingComponent',
        this,
        linkedApis[0]
      )
    };
    return this;
  }

  entityConstructor = PurchaseOrderScheduleLine;

  requestBuilder(): PurchaseOrderScheduleLineRequestBuilder<DeSerializersT> {
    return new PurchaseOrderScheduleLineRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    PurchaseOrderScheduleLine<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      PurchaseOrderScheduleLine<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    PurchaseOrderScheduleLine<DeSerializersT>,
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
    typeof PurchaseOrderScheduleLine,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        PurchaseOrderScheduleLine,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    PURCHASING_DOCUMENT: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASING_DOCUMENT_ITEM: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SCHEDULE_LINE: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DELIV_DATE_CATEGORY: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SCHEDULE_LINE_DELIVERY_DATE: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    PURCHASE_ORDER_QUANTITY_UNIT: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SCHEDULE_LINE_ORDER_QUANTITY: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    SCHEDULE_LINE_DELIVERY_TIME: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    SCHED_LINE_STSC_DELIVERY_DATE: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    PURCHASE_REQUISITION: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURCHASE_REQUISITION_ITEM: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SCHEDULE_LINE_COMMITTED_QUANTITY: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    PERFORMANCE_PERIOD_START_DATE: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    PERFORMANCE_PERIOD_END_DATE: OrderableEdmTypeField<
      PurchaseOrderScheduleLine<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSubcontractingComponent} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SUBCONTRACTING_COMPONENT: Link<
      PurchaseOrderScheduleLine<DeSerializersT>,
      DeSerializersT,
      PoSubcontractingComponentApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<PurchaseOrderScheduleLine<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link purchasingDocument} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_DOCUMENT: fieldBuilder.buildEdmTypeField(
          'PurchasingDocument',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link purchasingDocumentItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_DOCUMENT_ITEM: fieldBuilder.buildEdmTypeField(
          'PurchasingDocumentItem',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link scheduleLine} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHEDULE_LINE: fieldBuilder.buildEdmTypeField(
          'ScheduleLine',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link delivDateCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIV_DATE_CATEGORY: fieldBuilder.buildEdmTypeField(
          'DelivDateCategory',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link scheduleLineDeliveryDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHEDULE_LINE_DELIVERY_DATE: fieldBuilder.buildEdmTypeField(
          'ScheduleLineDeliveryDate',
          'Edm.DateTime',
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
         * Static representation of the {@link scheduleLineOrderQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHEDULE_LINE_ORDER_QUANTITY: fieldBuilder.buildEdmTypeField(
          'ScheduleLineOrderQuantity',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link scheduleLineDeliveryTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHEDULE_LINE_DELIVERY_TIME: fieldBuilder.buildEdmTypeField(
          'ScheduleLineDeliveryTime',
          'Edm.Time',
          true
        ),
        /**
         * Static representation of the {@link schedLineStscDeliveryDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHED_LINE_STSC_DELIVERY_DATE: fieldBuilder.buildEdmTypeField(
          'SchedLineStscDeliveryDate',
          'Edm.DateTime',
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
         * Static representation of the {@link scheduleLineCommittedQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHEDULE_LINE_COMMITTED_QUANTITY: fieldBuilder.buildEdmTypeField(
          'ScheduleLineCommittedQuantity',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link performancePeriodStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PERFORMANCE_PERIOD_START_DATE: fieldBuilder.buildEdmTypeField(
          'PerformancePeriodStartDate',
          'Edm.DateTime',
          true
        ),
        /**
         * Static representation of the {@link performancePeriodEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PERFORMANCE_PERIOD_END_DATE: fieldBuilder.buildEdmTypeField(
          'PerformancePeriodEndDate',
          'Edm.DateTime',
          true
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', PurchaseOrderScheduleLine)
      };
    }

    return this._schema;
  }
}
