/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  CreateRequestBuilder,
  DeleteRequestBuilder,
  DeSerializers,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  ODataBatchRequestBuilder,
  UpdateRequestBuilder,
  OperationRequestBuilder,
  BatchChangeSet
} from '@sap-cloud-sdk/odata-v2';
import { transformVariadicArgumentToArray } from '@sap-cloud-sdk/util';
import {
  PoSubcontractingComponent,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderItemNote,
  PurchaseOrderNote,
  PurchaseOrderScheduleLine,
  PurOrdAccountAssignment,
  PurOrdPricingElement,
  GetOutputBinaryDataParameters,
  GetPdfParameters,
  GetPdfResult
} from './index';

/**
 * Batch builder for operations supported on the Purchase Order Service.
 * @param requests The requests of the batch.
 * @returns A request builder for batch.
 */
export function batch<DeSerializersT extends DeSerializers>(
  ...requests: Array<
    | ReadPurchaseOrderServiceRequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT>;
export function batch<DeSerializersT extends DeSerializers>(
  requests: Array<
    | ReadPurchaseOrderServiceRequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT>;
export function batch<DeSerializersT extends DeSerializers>(
  first:
    | undefined
    | ReadPurchaseOrderServiceRequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
    | Array<
        | ReadPurchaseOrderServiceRequestBuilder<DeSerializersT>
        | BatchChangeSet<DeSerializersT>
      >,
  ...rest: Array<
    | ReadPurchaseOrderServiceRequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT> {
  return new ODataBatchRequestBuilder(
    defaultPurchaseOrderServicePath,
    transformVariadicArgumentToArray(first, rest)
  );
}

/**
 * Change set constructor consists of write operations supported on the Purchase Order Service.
 * @param requests The requests of the change set.
 * @returns A change set for batch.
 */
export function changeset<DeSerializersT extends DeSerializers>(
  ...requests: Array<WritePurchaseOrderServiceRequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT>;
export function changeset<DeSerializersT extends DeSerializers>(
  requests: Array<WritePurchaseOrderServiceRequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT>;
export function changeset<DeSerializersT extends DeSerializers>(
  first:
    | undefined
    | WritePurchaseOrderServiceRequestBuilder<DeSerializersT>
    | Array<WritePurchaseOrderServiceRequestBuilder<DeSerializersT>>,
  ...rest: Array<WritePurchaseOrderServiceRequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT> {
  return new BatchChangeSet(transformVariadicArgumentToArray(first, rest));
}

export const defaultPurchaseOrderServicePath =
  '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
export type ReadPurchaseOrderServiceRequestBuilder<
  DeSerializersT extends DeSerializers
> =
  | GetAllRequestBuilder<
      PoSubcontractingComponent<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<PurchaseOrder<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<PurchaseOrderItem<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<PurchaseOrderItemNote<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<PurchaseOrderNote<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<
      PurchaseOrderScheduleLine<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      PurOrdAccountAssignment<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<PurOrdPricingElement<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      PoSubcontractingComponent<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<PurchaseOrder<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<PurchaseOrderItem<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      PurchaseOrderItemNote<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<PurchaseOrderNote<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      PurchaseOrderScheduleLine<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      PurOrdAccountAssignment<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<PurOrdPricingElement<DeSerializersT>, DeSerializersT>
  | OperationRequestBuilder<
      DeSerializersT,
      GetOutputBinaryDataParameters<DeSerializersT>,
      GetPdfResult
    >
  | OperationRequestBuilder<
      DeSerializersT,
      GetPdfParameters<DeSerializersT>,
      GetPdfResult
    >;
export type WritePurchaseOrderServiceRequestBuilder<
  DeSerializersT extends DeSerializers
> =
  | CreateRequestBuilder<
      PoSubcontractingComponent<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      PoSubcontractingComponent<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      PoSubcontractingComponent<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<PurchaseOrder<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<PurchaseOrder<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<PurchaseOrder<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<PurchaseOrderItem<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<PurchaseOrderItem<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<PurchaseOrderItem<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<PurchaseOrderItemNote<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<PurchaseOrderItemNote<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<PurchaseOrderItemNote<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<PurchaseOrderNote<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<PurchaseOrderNote<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<PurchaseOrderNote<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<
      PurchaseOrderScheduleLine<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      PurchaseOrderScheduleLine<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      PurchaseOrderScheduleLine<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      PurOrdAccountAssignment<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      PurOrdAccountAssignment<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      PurOrdAccountAssignment<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<PurOrdPricingElement<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<PurOrdPricingElement<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<PurOrdPricingElement<DeSerializersT>, DeSerializersT>;
