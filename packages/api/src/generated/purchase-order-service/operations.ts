/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  entityDeserializer,
  transformReturnValueForComplexType,
  DeSerializers,
  DefaultDeSerializers,
  defaultDeSerializers,
  OperationParameter,
  OperationRequestBuilder
} from '@sap-cloud-sdk/odata-v2';
import { purchaseOrderService } from './service';
import { GetPdfResult } from './GetPdfResult';

/**
 * Type of the parameters to be passed to {@link getOutputBinaryData}.
 */
export interface GetOutputBinaryDataParameters<
  DeSerializersT extends DeSerializers
> {
  /**
   * Purchase Order.
   */
  purchaseOrder?: string | null;
}

/**
 * Get Output Binary Data.
 * @param parameters - Object containing all parameters for the function.
 * @returns A request builder that allows to overwrite some of the values and execute the resulting request.
 */
export function getOutputBinaryData<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
>(
  parameters: GetOutputBinaryDataParameters<DeSerializersT>,
  deSerializers: DeSerializersT = defaultDeSerializers as DeSerializersT
): OperationRequestBuilder<
  DeSerializersT,
  GetOutputBinaryDataParameters<DeSerializersT>,
  GetPdfResult
> {
  const params = {
    purchaseOrder: new OperationParameter(
      'PurchaseOrder',
      'Edm.String',
      parameters.purchaseOrder
    )
  };

  return new OperationRequestBuilder(
    'get',
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV',
    'GetOutputBinaryData',
    data =>
      transformReturnValueForComplexType(data, data =>
        entityDeserializer(
          deSerializers || defaultDeSerializers
        ).deserializeComplexType(data, GetPdfResult)
      ),
    params,
    deSerializers
  );
}

/**
 * Type of the parameters to be passed to {@link getPdf}.
 */
export interface GetPdfParameters<DeSerializersT extends DeSerializers> {
  /**
   * Purchase Order.
   */
  purchaseOrder?: string | null;
}

/**
 * Get Pdf.
 * @param parameters - Object containing all parameters for the function.
 * @returns A request builder that allows to overwrite some of the values and execute the resulting request.
 */
export function getPdf<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
>(
  parameters: GetPdfParameters<DeSerializersT>,
  deSerializers: DeSerializersT = defaultDeSerializers as DeSerializersT
): OperationRequestBuilder<
  DeSerializersT,
  GetPdfParameters<DeSerializersT>,
  GetPdfResult
> {
  const params = {
    purchaseOrder: new OperationParameter(
      'PurchaseOrder',
      'Edm.String',
      parameters.purchaseOrder
    )
  };

  return new OperationRequestBuilder(
    'get',
    '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV',
    'GetPDF',
    data =>
      transformReturnValueForComplexType(data, data =>
        entityDeserializer(
          deSerializers || defaultDeSerializers
        ).deserializeComplexType(data, GetPdfResult)
      ),
    params,
    deSerializers
  );
}

export const operations = {
  getOutputBinaryData,
  getPdf
};
