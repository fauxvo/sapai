/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { PoSubcontractingComponent } from './PoSubcontractingComponent';
import { PoSubcontractingComponentRequestBuilder } from './PoSubcontractingComponentRequestBuilder';
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
export class PoSubcontractingComponentApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<
  PoSubcontractingComponent<DeSerializersT>,
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
  ): PoSubcontractingComponentApi<DeSerializersT> {
    return new PoSubcontractingComponentApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = PoSubcontractingComponent;

  requestBuilder(): PoSubcontractingComponentRequestBuilder<DeSerializersT> {
    return new PoSubcontractingComponentRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    PoSubcontractingComponent<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      PoSubcontractingComponent<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    PoSubcontractingComponent<DeSerializersT>,
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
    typeof PoSubcontractingComponent,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        PoSubcontractingComponent,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    PURCHASE_ORDER: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_ORDER_ITEM: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SCHEDULE_LINE: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    RESERVATION_ITEM: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    RECORD_TYPE: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    MATERIAL: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BOM_ITEM_DESCRIPTION: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    REQUIRED_QUANTITY: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BASE_UNIT: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    REQUIREMENT_DATE: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    QUANTITY_IN_ENTRY_UNIT: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    ENTRY_UNIT: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WITHDRAWN_QUANTITY: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    PLANT: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BATCH: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    REQUIREMENT_SEGMENT: OrderableEdmTypeField<
      PoSubcontractingComponent<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<PoSubcontractingComponent<DeSerializers>>;
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
         * Static representation of the {@link scheduleLine} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SCHEDULE_LINE: fieldBuilder.buildEdmTypeField(
          'ScheduleLine',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link reservationItem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RESERVATION_ITEM: fieldBuilder.buildEdmTypeField(
          'ReservationItem',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link recordType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RECORD_TYPE: fieldBuilder.buildEdmTypeField(
          'RecordType',
          'Edm.String',
          false
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
         * Static representation of the {@link bomItemDescription} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BOM_ITEM_DESCRIPTION: fieldBuilder.buildEdmTypeField(
          'BOMItemDescription',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link requiredQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REQUIRED_QUANTITY: fieldBuilder.buildEdmTypeField(
          'RequiredQuantity',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link baseUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BASE_UNIT: fieldBuilder.buildEdmTypeField(
          'BaseUnit',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link requirementDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REQUIREMENT_DATE: fieldBuilder.buildEdmTypeField(
          'RequirementDate',
          'Edm.DateTime',
          true
        ),
        /**
         * Static representation of the {@link quantityInEntryUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        QUANTITY_IN_ENTRY_UNIT: fieldBuilder.buildEdmTypeField(
          'QuantityInEntryUnit',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link entryUnit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ENTRY_UNIT: fieldBuilder.buildEdmTypeField(
          'EntryUnit',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link withdrawnQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WITHDRAWN_QUANTITY: fieldBuilder.buildEdmTypeField(
          'WithdrawnQuantity',
          'Edm.Decimal',
          true
        ),
        /**
         * Static representation of the {@link plant} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PLANT: fieldBuilder.buildEdmTypeField('Plant', 'Edm.String', true),
        /**
         * Static representation of the {@link batch} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BATCH: fieldBuilder.buildEdmTypeField('Batch', 'Edm.String', true),
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
        ALL_FIELDS: new AllFields('*', PoSubcontractingComponent)
      };
    }

    return this._schema;
  }
}
