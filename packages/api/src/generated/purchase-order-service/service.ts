/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { PoSubcontractingComponentApi } from './PoSubcontractingComponentApi';
import { PurchaseOrderApi } from './PurchaseOrderApi';
import { PurchaseOrderItemApi } from './PurchaseOrderItemApi';
import { PurchaseOrderItemNoteApi } from './PurchaseOrderItemNoteApi';
import { PurchaseOrderNoteApi } from './PurchaseOrderNoteApi';
import { PurchaseOrderScheduleLineApi } from './PurchaseOrderScheduleLineApi';
import { PurOrdAccountAssignmentApi } from './PurOrdAccountAssignmentApi';
import { PurOrdPricingElementApi } from './PurOrdPricingElementApi';
import {
  getOutputBinaryData,
  getPdf,
  GetOutputBinaryDataParameters,
  GetPdfParameters
} from './operations';
import { BigNumber } from 'bignumber.js';
import { Moment } from 'moment';
import {
  defaultDeSerializers,
  DeSerializers,
  DefaultDeSerializers,
  mergeDefaultDeSerializersWith,
  Time
} from '@sap-cloud-sdk/odata-v2';
import { batch, changeset } from './BatchRequest';

export function purchaseOrderService<
  BinaryT = string,
  BooleanT = boolean,
  ByteT = number,
  DecimalT = BigNumber,
  DoubleT = number,
  FloatT = number,
  Int16T = number,
  Int32T = number,
  Int64T = BigNumber,
  GuidT = string,
  SByteT = number,
  SingleT = number,
  StringT = string,
  AnyT = any,
  DateTimeOffsetT = Moment,
  DateTimeT = Moment,
  TimeT = Time
>(
  deSerializers: Partial<
    DeSerializers<
      BinaryT,
      BooleanT,
      ByteT,
      DecimalT,
      DoubleT,
      FloatT,
      Int16T,
      Int32T,
      Int64T,
      GuidT,
      SByteT,
      SingleT,
      StringT,
      AnyT,
      DateTimeOffsetT,
      DateTimeT,
      TimeT
    >
  > = defaultDeSerializers as any
): PurchaseOrderService<
  DeSerializers<
    BinaryT,
    BooleanT,
    ByteT,
    DecimalT,
    DoubleT,
    FloatT,
    Int16T,
    Int32T,
    Int64T,
    GuidT,
    SByteT,
    SingleT,
    StringT,
    AnyT,
    DateTimeOffsetT,
    DateTimeT,
    TimeT
  >
> {
  return new PurchaseOrderService(mergeDefaultDeSerializersWith(deSerializers));
}
class PurchaseOrderService<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> {
  private apis: Record<string, any> = {};
  private deSerializers: DeSerializersT;

  constructor(deSerializers: DeSerializersT) {
    this.deSerializers = deSerializers;
  }

  private initApi(key: string, entityApi: any): any {
    if (!this.apis[key]) {
      this.apis[key] = entityApi._privateFactory(this.deSerializers);
    }
    return this.apis[key];
  }

  get poSubcontractingComponentApi(): PoSubcontractingComponentApi<DeSerializersT> {
    return this.initApi(
      'poSubcontractingComponentApi',
      PoSubcontractingComponentApi
    );
  }

  get purchaseOrderApi(): PurchaseOrderApi<DeSerializersT> {
    const api = this.initApi('purchaseOrderApi', PurchaseOrderApi);
    const linkedApis = [
      this.initApi('purchaseOrderItemApi', PurchaseOrderItemApi),
      this.initApi('purchaseOrderNoteApi', PurchaseOrderNoteApi)
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get purchaseOrderItemApi(): PurchaseOrderItemApi<DeSerializersT> {
    const api = this.initApi('purchaseOrderItemApi', PurchaseOrderItemApi);
    const linkedApis = [
      this.initApi('purchaseOrderApi', PurchaseOrderApi),
      this.initApi('purOrdAccountAssignmentApi', PurOrdAccountAssignmentApi),
      this.initApi('purchaseOrderItemNoteApi', PurchaseOrderItemNoteApi),
      this.initApi('purOrdPricingElementApi', PurOrdPricingElementApi),
      this.initApi('purchaseOrderScheduleLineApi', PurchaseOrderScheduleLineApi)
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get purchaseOrderItemNoteApi(): PurchaseOrderItemNoteApi<DeSerializersT> {
    return this.initApi('purchaseOrderItemNoteApi', PurchaseOrderItemNoteApi);
  }

  get purchaseOrderNoteApi(): PurchaseOrderNoteApi<DeSerializersT> {
    return this.initApi('purchaseOrderNoteApi', PurchaseOrderNoteApi);
  }

  get purchaseOrderScheduleLineApi(): PurchaseOrderScheduleLineApi<DeSerializersT> {
    const api = this.initApi(
      'purchaseOrderScheduleLineApi',
      PurchaseOrderScheduleLineApi
    );
    const linkedApis = [
      this.initApi('poSubcontractingComponentApi', PoSubcontractingComponentApi)
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get purOrdAccountAssignmentApi(): PurOrdAccountAssignmentApi<DeSerializersT> {
    return this.initApi(
      'purOrdAccountAssignmentApi',
      PurOrdAccountAssignmentApi
    );
  }

  get purOrdPricingElementApi(): PurOrdPricingElementApi<DeSerializersT> {
    return this.initApi('purOrdPricingElementApi', PurOrdPricingElementApi);
  }

  get operations() {
    return {
      getOutputBinaryData: (
        parameter: GetOutputBinaryDataParameters<DeSerializersT>
      ) => getOutputBinaryData(parameter, this.deSerializers),
      getPdf: (parameter: GetPdfParameters<DeSerializersT>) =>
        getPdf(parameter, this.deSerializers)
    };
  }

  get batch(): typeof batch {
    return batch;
  }

  get changeset(): typeof changeset {
    return changeset;
  }
}
