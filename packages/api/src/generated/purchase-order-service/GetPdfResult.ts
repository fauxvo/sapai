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
 * GetPdfResult
 */
export interface GetPdfResult<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> {
  /**
   * Purchase Order Binary.
   */
  purchaseOrderBinary: DeserializedType<DeSerializersT, 'Edm.String'>;
}

/**
 * GetPdfResultField
 * @typeParam EntityT - Type of the entity the complex type field belongs to.
 */
export class GetPdfResultField<
  EntityT extends Entity,
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
  NullableT extends boolean = false,
  SelectableT extends boolean = false
> extends ComplexTypeField<
  EntityT,
  DeSerializersT,
  GetPdfResult,
  NullableT,
  SelectableT
> {
  private _fieldBuilder: FieldBuilder<this, DeSerializersT> = new FieldBuilder(
    this,
    this.deSerializers
  );
  /**
   * Representation of the {@link GetPdfResult.purchaseOrderBinary} property for query construction.
   * Use to reference this property in query operations such as 'filter' in the fluent request API.
   */
  purchaseOrderBinary: OrderableEdmTypeField<
    EntityT,
    DeSerializersT,
    'Edm.String',
    false,
    false
  > = this._fieldBuilder.buildEdmTypeField(
    'PurchaseOrderBinary',
    'Edm.String',
    false
  );

  /**
   * Creates an instance of GetPdfResultField.
   * @param fieldName - Actual name of the field as used in the OData request.
   * @param fieldOf - Either the parent entity constructor of the parent complex type this field belongs to.
   */
  constructor(
    fieldName: string,
    fieldOf: ConstructorOrField<EntityT>,
    deSerializers: DeSerializersT,
    fieldOptions?: FieldOptions<NullableT, SelectableT>
  ) {
    super(fieldName, fieldOf, deSerializers, GetPdfResult, fieldOptions);
  }
}

export namespace GetPdfResult {
  /**
   * Metadata information on all properties of the `GetPdfResult` complex type.
   */
  export const _propertyMetadata: PropertyMetadata<GetPdfResult>[] = [
    {
      originalName: 'PurchaseOrderBinary',
      name: 'purchaseOrderBinary',
      type: 'Edm.String',
      isCollection: false
    }
  ];
}
