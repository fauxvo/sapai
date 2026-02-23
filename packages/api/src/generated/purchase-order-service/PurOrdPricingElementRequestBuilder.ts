/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  CreateRequestBuilder,
  DeSerializers,
  DefaultDeSerializers,
  DeleteRequestBuilder,
  DeserializedType,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  RequestBuilder,
  UpdateRequestBuilder
} from '@sap-cloud-sdk/odata-v2';
import { PurOrdPricingElement } from './PurOrdPricingElement';

/**
 * Request builder class for operations supported on the {@link PurOrdPricingElement} entity.
 */
export class PurOrdPricingElementRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers
> extends RequestBuilder<PurOrdPricingElement<T>, T> {
  /**
   * Returns a request builder for querying all `PurOrdPricingElement` entities.
   * @returns A request builder for creating requests to retrieve all `PurOrdPricingElement` entities.
   */
  getAll(): GetAllRequestBuilder<PurOrdPricingElement<T>, T> {
    return new GetAllRequestBuilder<PurOrdPricingElement<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for creating a `PurOrdPricingElement` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `PurOrdPricingElement`.
   */
  create(
    entity: PurOrdPricingElement<T>
  ): CreateRequestBuilder<PurOrdPricingElement<T>, T> {
    return new CreateRequestBuilder<PurOrdPricingElement<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for retrieving one `PurOrdPricingElement` entity based on its keys.
   * @param purchaseOrder Key property. See {@link PurOrdPricingElement.purchaseOrder}.
   * @param purchaseOrderItem Key property. See {@link PurOrdPricingElement.purchaseOrderItem}.
   * @param pricingDocument Key property. See {@link PurOrdPricingElement.pricingDocument}.
   * @param pricingDocumentItem Key property. See {@link PurOrdPricingElement.pricingDocumentItem}.
   * @param pricingProcedureStep Key property. See {@link PurOrdPricingElement.pricingProcedureStep}.
   * @param pricingProcedureCounter Key property. See {@link PurOrdPricingElement.pricingProcedureCounter}.
   * @returns A request builder for creating requests to retrieve one `PurOrdPricingElement` entity based on its keys.
   */
  getByKey(
    purchaseOrder: DeserializedType<T, 'Edm.String'>,
    purchaseOrderItem: DeserializedType<T, 'Edm.String'>,
    pricingDocument: DeserializedType<T, 'Edm.String'>,
    pricingDocumentItem: DeserializedType<T, 'Edm.String'>,
    pricingProcedureStep: DeserializedType<T, 'Edm.String'>,
    pricingProcedureCounter: DeserializedType<T, 'Edm.String'>
  ): GetByKeyRequestBuilder<PurOrdPricingElement<T>, T> {
    return new GetByKeyRequestBuilder<PurOrdPricingElement<T>, T>(
      this.entityApi,
      {
        PurchaseOrder: purchaseOrder,
        PurchaseOrderItem: purchaseOrderItem,
        PricingDocument: pricingDocument,
        PricingDocumentItem: pricingDocumentItem,
        PricingProcedureStep: pricingProcedureStep,
        PricingProcedureCounter: pricingProcedureCounter
      }
    );
  }

  /**
   * Returns a request builder for updating an entity of type `PurOrdPricingElement`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `PurOrdPricingElement`.
   */
  update(
    entity: PurOrdPricingElement<T>
  ): UpdateRequestBuilder<PurOrdPricingElement<T>, T> {
    return new UpdateRequestBuilder<PurOrdPricingElement<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `PurOrdPricingElement`.
   * @param purchaseOrder Key property. See {@link PurOrdPricingElement.purchaseOrder}.
   * @param purchaseOrderItem Key property. See {@link PurOrdPricingElement.purchaseOrderItem}.
   * @param pricingDocument Key property. See {@link PurOrdPricingElement.pricingDocument}.
   * @param pricingDocumentItem Key property. See {@link PurOrdPricingElement.pricingDocumentItem}.
   * @param pricingProcedureStep Key property. See {@link PurOrdPricingElement.pricingProcedureStep}.
   * @param pricingProcedureCounter Key property. See {@link PurOrdPricingElement.pricingProcedureCounter}.
   * @returns A request builder for creating requests that delete an entity of type `PurOrdPricingElement`.
   */
  delete(
    purchaseOrder: string,
    purchaseOrderItem: string,
    pricingDocument: string,
    pricingDocumentItem: string,
    pricingProcedureStep: string,
    pricingProcedureCounter: string
  ): DeleteRequestBuilder<PurOrdPricingElement<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `PurOrdPricingElement`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `PurOrdPricingElement` by taking the entity as a parameter.
   */
  delete(
    entity: PurOrdPricingElement<T>
  ): DeleteRequestBuilder<PurOrdPricingElement<T>, T>;
  delete(
    purchaseOrderOrEntity: any,
    purchaseOrderItem?: string,
    pricingDocument?: string,
    pricingDocumentItem?: string,
    pricingProcedureStep?: string,
    pricingProcedureCounter?: string
  ): DeleteRequestBuilder<PurOrdPricingElement<T>, T> {
    return new DeleteRequestBuilder<PurOrdPricingElement<T>, T>(
      this.entityApi,
      purchaseOrderOrEntity instanceof PurOrdPricingElement
        ? purchaseOrderOrEntity
        : {
            PurchaseOrder: purchaseOrderOrEntity!,
            PurchaseOrderItem: purchaseOrderItem!,
            PricingDocument: pricingDocument!,
            PricingDocumentItem: pricingDocumentItem!,
            PricingProcedureStep: pricingProcedureStep!,
            PricingProcedureCounter: pricingProcedureCounter!
          }
    );
  }
}
