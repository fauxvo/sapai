/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  ComplexTypeField,
  ConstructorOrField,
  DeSerializers,
  DefaultDeSerializers,
  DeserializedType,
  EdmTypeField,
  Entity,
  FieldBuilder,
  FieldOptions,
  OrderableEdmTypeField,
  PropertyMetadata
} from '@sap-cloud-sdk/odata-v2';

/**
 * DummyFunctionImportResult
 */
export interface DummyFunctionImportResult<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> {
  /**
   * TRUE.
   * @nullable
   */
  isInvalid?: DeserializedType<DeSerializersT, 'Edm.Boolean'>;
}

/**
 * DummyFunctionImportResultField
 * @typeParam EntityT - Type of the entity the complex type field belongs to.
 */
export class DummyFunctionImportResultField<
  EntityT extends Entity,
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
  NullableT extends boolean = false,
  SelectableT extends boolean = false
> extends ComplexTypeField<
  EntityT,
  DeSerializersT,
  DummyFunctionImportResult,
  NullableT,
  SelectableT
> {
  private _fieldBuilder: FieldBuilder<this, DeSerializersT> = new FieldBuilder(
    this,
    this.deSerializers
  );
  /**
   * Representation of the {@link DummyFunctionImportResult.isInvalid} property for query construction.
   * Use to reference this property in query operations such as 'filter' in the fluent request API.
   */
  isInvalid: OrderableEdmTypeField<
    EntityT,
    DeSerializersT,
    'Edm.Boolean',
    true,
    false
  > = this._fieldBuilder.buildEdmTypeField('IsInvalid', 'Edm.Boolean', true);

  /**
   * Creates an instance of DummyFunctionImportResultField.
   * @param fieldName - Actual name of the field as used in the OData request.
   * @param fieldOf - Either the parent entity constructor of the parent complex type this field belongs to.
   */
  constructor(
    fieldName: string,
    fieldOf: ConstructorOrField<EntityT>,
    deSerializers: DeSerializersT,
    fieldOptions?: FieldOptions<NullableT, SelectableT>
  ) {
    super(
      fieldName,
      fieldOf,
      deSerializers,
      DummyFunctionImportResult,
      fieldOptions
    );
  }
}

export namespace DummyFunctionImportResult {
  /**
   * Metadata information on all properties of the `DummyFunctionImportResult` complex type.
   */
  export const _propertyMetadata: PropertyMetadata<DummyFunctionImportResult>[] =
    [
      {
        originalName: 'IsInvalid',
        name: 'isInvalid',
        type: 'Edm.Boolean',
        isCollection: false
      }
    ];
}
