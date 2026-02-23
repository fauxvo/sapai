/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { PurchaseOrderItemNote } from './PurchaseOrderItemNote';
import { PurchaseOrderItemNoteRequestBuilder } from './PurchaseOrderItemNoteRequestBuilder';
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
export class PurchaseOrderItemNoteApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<PurchaseOrderItemNote<DeSerializersT>, DeSerializersT> {
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
  ): PurchaseOrderItemNoteApi<DeSerializersT> {
    return new PurchaseOrderItemNoteApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = PurchaseOrderItemNote;

  requestBuilder(): PurchaseOrderItemNoteRequestBuilder<DeSerializersT> {
    return new PurchaseOrderItemNoteRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    PurchaseOrderItemNote<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<PurchaseOrderItemNote<DeSerializersT>, DeSerializersT>(
      this
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    PurchaseOrderItemNote<DeSerializersT>,
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
    typeof PurchaseOrderItemNote,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        PurchaseOrderItemNote,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    PURCHASE_ORDER: OrderableEdmTypeField<
      PurchaseOrderItemNote<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURCHASE_ORDER_ITEM: OrderableEdmTypeField<
      PurchaseOrderItemNote<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    TEXT_OBJECT_TYPE: OrderableEdmTypeField<
      PurchaseOrderItemNote<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    LANGUAGE: OrderableEdmTypeField<
      PurchaseOrderItemNote<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PLAIN_LONG_TEXT: OrderableEdmTypeField<
      PurchaseOrderItemNote<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<PurchaseOrderItemNote<DeSerializers>>;
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
         * Static representation of the {@link textObjectType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TEXT_OBJECT_TYPE: fieldBuilder.buildEdmTypeField(
          'TextObjectType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link language} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LANGUAGE: fieldBuilder.buildEdmTypeField(
          'Language',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link plainLongText} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PLAIN_LONG_TEXT: fieldBuilder.buildEdmTypeField(
          'PlainLongText',
          'Edm.String',
          true
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', PurchaseOrderItemNote)
      };
    }

    return this._schema;
  }
}
