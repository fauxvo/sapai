import { BigNumber } from 'bignumber.js';
// moment is required by SAP Cloud SDK generated entity types for Edm.DateTime fields
import moment from 'moment';
import { purchaseOrderService } from '../../generated/purchase-order-service/service.js';
import type { PurOrdAccountAssignment } from '../../generated/purchase-order-service/PurOrdAccountAssignment.js';
import { BaseService } from '../base/BaseService.js';
import type { ServiceResult } from '../base/types.js';
import type {
  CreateAccountAssignmentInput,
  UpdateAccountAssignmentInput,
} from './types.js';

export class PurchaseOrderAccountAssignmentService extends BaseService {
  // Safe as singleton: purchaseOrderService() returns stateless API accessors.
  // CSRF tokens and ETags are managed per-request by the SDK, not cached here.
  private readonly svc = purchaseOrderService();

  async getAccountAssignments(
    poId: string,
    itemId: string,
  ): Promise<ServiceResult<PurOrdAccountAssignment[]>> {
    return this.execute(() => {
      const { purOrdAccountAssignmentApi } = this.svc;
      return purOrdAccountAssignmentApi
        .requestBuilder()
        .getAll()
        .filter(
          purOrdAccountAssignmentApi.schema.PURCHASE_ORDER.equals(poId),
          purOrdAccountAssignmentApi.schema.PURCHASE_ORDER_ITEM.equals(itemId),
        )
        .execute(this.destination);
    });
  }

  async getAccountAssignmentByKey(
    poId: string,
    itemId: string,
    assignmentNum: string,
  ): Promise<ServiceResult<PurOrdAccountAssignment>> {
    return this.execute(() => {
      const { purOrdAccountAssignmentApi } = this.svc;
      return purOrdAccountAssignmentApi
        .requestBuilder()
        .getByKey(poId, itemId, assignmentNum)
        .execute(this.destination);
    });
  }

  async createAccountAssignment(
    poId: string,
    itemId: string,
    input: CreateAccountAssignmentInput,
  ): Promise<ServiceResult<PurOrdAccountAssignment>> {
    return this.execute(() => {
      const { purOrdAccountAssignmentApi } = this.svc;

      const entity = purOrdAccountAssignmentApi
        .entityBuilder()
        .purchaseOrder(poId)
        .purchaseOrderItem(itemId)
        .build();

      // String fields
      if (input.accountAssignmentNumber !== undefined)
        entity.accountAssignmentNumber = input.accountAssignmentNumber;
      if (input.glAccount !== undefined) entity.glAccount = input.glAccount;
      if (input.costCenter !== undefined) entity.costCenter = input.costCenter;
      if (input.wbsElement !== undefined) entity.wbsElement = input.wbsElement;
      if (input.orderId !== undefined) entity.orderId = input.orderId;
      if (input.profitCenter !== undefined)
        entity.profitCenter = input.profitCenter;
      if (input.businessArea !== undefined)
        entity.businessArea = input.businessArea;
      if (input.functionalArea !== undefined)
        entity.functionalArea = input.functionalArea;
      if (input.fund !== undefined) entity.fund = input.fund;
      if (input.fundsCenter !== undefined)
        entity.fundsCenter = input.fundsCenter;
      if (input.masterFixedAsset !== undefined)
        entity.masterFixedAsset = input.masterFixedAsset;
      if (input.fixedAsset !== undefined) entity.fixedAsset = input.fixedAsset;
      if (input.projectNetwork !== undefined)
        entity.projectNetwork = input.projectNetwork;
      if (input.networkActivity !== undefined)
        entity.networkActivity = input.networkActivity;
      if (input.taxCode !== undefined) entity.taxCode = input.taxCode;

      // BigNumber fields
      if (input.quantity !== undefined)
        entity.quantity = new BigNumber(input.quantity);
      if (input.multipleAcctAssgmtDistrPercent !== undefined)
        entity.multipleAcctAssgmtDistrPercent = new BigNumber(
          input.multipleAcctAssgmtDistrPercent,
        );

      // DateTime fields
      if (input.settlementReferenceDate !== undefined)
        entity.settlementReferenceDate = moment(input.settlementReferenceDate);

      return purOrdAccountAssignmentApi
        .requestBuilder()
        .create(entity)
        .execute(this.destination);
    });
  }

  async updateAccountAssignment(
    poId: string,
    itemId: string,
    assignmentNum: string,
    input: UpdateAccountAssignmentInput,
  ): Promise<ServiceResult<PurOrdAccountAssignment>> {
    return this.execute(async () => {
      const { purOrdAccountAssignmentApi } = this.svc;

      // Read first to get ETag for optimistic locking
      const existing = await purOrdAccountAssignmentApi
        .requestBuilder()
        .getByKey(poId, itemId, assignmentNum)
        .execute(this.destination);

      // String fields
      if (input.glAccount !== undefined) existing.glAccount = input.glAccount;
      if (input.costCenter !== undefined)
        existing.costCenter = input.costCenter;
      if (input.wbsElement !== undefined)
        existing.wbsElement = input.wbsElement;
      if (input.orderId !== undefined) existing.orderId = input.orderId;
      if (input.profitCenter !== undefined)
        existing.profitCenter = input.profitCenter;
      if (input.businessArea !== undefined)
        existing.businessArea = input.businessArea;
      if (input.functionalArea !== undefined)
        existing.functionalArea = input.functionalArea;
      if (input.fund !== undefined) existing.fund = input.fund;
      if (input.fundsCenter !== undefined)
        existing.fundsCenter = input.fundsCenter;
      if (input.masterFixedAsset !== undefined)
        existing.masterFixedAsset = input.masterFixedAsset;
      if (input.fixedAsset !== undefined)
        existing.fixedAsset = input.fixedAsset;
      if (input.projectNetwork !== undefined)
        existing.projectNetwork = input.projectNetwork;
      if (input.networkActivity !== undefined)
        existing.networkActivity = input.networkActivity;
      if (input.taxCode !== undefined) existing.taxCode = input.taxCode;

      // BigNumber fields
      if (input.quantity !== undefined)
        existing.quantity = new BigNumber(input.quantity);
      if (input.multipleAcctAssgmtDistrPercent !== undefined)
        existing.multipleAcctAssgmtDistrPercent = new BigNumber(
          input.multipleAcctAssgmtDistrPercent,
        );

      // DateTime fields
      if (input.settlementReferenceDate !== undefined)
        existing.settlementReferenceDate = moment(
          input.settlementReferenceDate,
        );

      return purOrdAccountAssignmentApi
        .requestBuilder()
        .update(existing)
        .execute(this.destination);
    });
  }

  async deleteAccountAssignment(
    poId: string,
    itemId: string,
    assignmentNum: string,
  ): Promise<ServiceResult<void>> {
    return this.execute(() => {
      const { purOrdAccountAssignmentApi } = this.svc;
      return purOrdAccountAssignmentApi
        .requestBuilder()
        .delete(poId, itemId, assignmentNum)
        .execute(this.destination);
    });
  }
}
