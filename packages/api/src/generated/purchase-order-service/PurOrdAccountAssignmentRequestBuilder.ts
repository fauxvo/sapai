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
import { PurOrdAccountAssignment } from './PurOrdAccountAssignment';

/**
 * Request builder class for operations supported on the {@link PurOrdAccountAssignment} entity.
 */
export class PurOrdAccountAssignmentRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers
> extends RequestBuilder<PurOrdAccountAssignment<T>, T> {
  /**
   * Returns a request builder for querying all `PurOrdAccountAssignment` entities.
   * @returns A request builder for creating requests to retrieve all `PurOrdAccountAssignment` entities.
   */
  getAll(): GetAllRequestBuilder<PurOrdAccountAssignment<T>, T> {
    return new GetAllRequestBuilder<PurOrdAccountAssignment<T>, T>(
      this.entityApi
    );
  }

  /**
   * Returns a request builder for creating a `PurOrdAccountAssignment` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `PurOrdAccountAssignment`.
   */
  create(
    entity: PurOrdAccountAssignment<T>
  ): CreateRequestBuilder<PurOrdAccountAssignment<T>, T> {
    return new CreateRequestBuilder<PurOrdAccountAssignment<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for retrieving one `PurOrdAccountAssignment` entity based on its keys.
   * @param purchaseOrder Key property. See {@link PurOrdAccountAssignment.purchaseOrder}.
   * @param purchaseOrderItem Key property. See {@link PurOrdAccountAssignment.purchaseOrderItem}.
   * @param accountAssignmentNumber Key property. See {@link PurOrdAccountAssignment.accountAssignmentNumber}.
   * @returns A request builder for creating requests to retrieve one `PurOrdAccountAssignment` entity based on its keys.
   */
  getByKey(
    purchaseOrder: DeserializedType<T, 'Edm.String'>,
    purchaseOrderItem: DeserializedType<T, 'Edm.String'>,
    accountAssignmentNumber: DeserializedType<T, 'Edm.String'>
  ): GetByKeyRequestBuilder<PurOrdAccountAssignment<T>, T> {
    return new GetByKeyRequestBuilder<PurOrdAccountAssignment<T>, T>(
      this.entityApi,
      {
        PurchaseOrder: purchaseOrder,
        PurchaseOrderItem: purchaseOrderItem,
        AccountAssignmentNumber: accountAssignmentNumber
      }
    );
  }

  /**
   * Returns a request builder for updating an entity of type `PurOrdAccountAssignment`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `PurOrdAccountAssignment`.
   */
  update(
    entity: PurOrdAccountAssignment<T>
  ): UpdateRequestBuilder<PurOrdAccountAssignment<T>, T> {
    return new UpdateRequestBuilder<PurOrdAccountAssignment<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `PurOrdAccountAssignment`.
   * @param purchaseOrder Key property. See {@link PurOrdAccountAssignment.purchaseOrder}.
   * @param purchaseOrderItem Key property. See {@link PurOrdAccountAssignment.purchaseOrderItem}.
   * @param accountAssignmentNumber Key property. See {@link PurOrdAccountAssignment.accountAssignmentNumber}.
   * @returns A request builder for creating requests that delete an entity of type `PurOrdAccountAssignment`.
   */
  delete(
    purchaseOrder: string,
    purchaseOrderItem: string,
    accountAssignmentNumber: string
  ): DeleteRequestBuilder<PurOrdAccountAssignment<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `PurOrdAccountAssignment`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `PurOrdAccountAssignment` by taking the entity as a parameter.
   */
  delete(
    entity: PurOrdAccountAssignment<T>
  ): DeleteRequestBuilder<PurOrdAccountAssignment<T>, T>;
  delete(
    purchaseOrderOrEntity: any,
    purchaseOrderItem?: string,
    accountAssignmentNumber?: string
  ): DeleteRequestBuilder<PurOrdAccountAssignment<T>, T> {
    return new DeleteRequestBuilder<PurOrdAccountAssignment<T>, T>(
      this.entityApi,
      purchaseOrderOrEntity instanceof PurOrdAccountAssignment
        ? purchaseOrderOrEntity
        : {
            PurchaseOrder: purchaseOrderOrEntity!,
            PurchaseOrderItem: purchaseOrderItem!,
            AccountAssignmentNumber: accountAssignmentNumber!
          }
    );
  }
}
