import type {
  ExecutionPlan,
  ExecutionResult,
  ExecutionActionResult,
  PlannedAction,
} from '@sapai/shared';
import { PurchaseOrderService } from '../purchase-order/PurchaseOrderService.js';
import { AuditLogger } from './AuditLogger.js';

export class Executor {
  private poService: PurchaseOrderService;
  private auditLogger: AuditLogger;

  constructor(poService?: PurchaseOrderService, auditLogger?: AuditLogger) {
    this.poService = poService ?? new PurchaseOrderService();
    this.auditLogger = auditLogger ?? new AuditLogger();
  }

  async execute(
    plan: ExecutionPlan,
    conversationId?: string,
  ): Promise<ExecutionResult> {
    const results: ExecutionActionResult[] = [];
    let overallSuccess = true;

    let hasPriorFailure = false;

    for (const action of plan.intents) {
      // Stop executing write operations after a prior failure
      const isWrite = action.apiCall.method !== 'GET';
      if (hasPriorFailure && isWrite) {
        const skipped: ExecutionActionResult = {
          intentId: action.intentId,
          success: false,
          error: 'Skipped due to prior action failure',
        };
        results.push(skipped);
        overallSuccess = false;
        continue;
      }

      const start = Date.now();
      let actionResult: ExecutionActionResult;

      try {
        actionResult = await this.executeAction(action);
      } catch (err) {
        actionResult = {
          intentId: action.intentId,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown execution error',
        };
      }

      const durationMs = Date.now() - start;

      if (!actionResult.success) {
        overallSuccess = false;
        hasPriorFailure = true;
      }

      results.push(actionResult);

      // Log each action execution
      await this.auditLogger.log({
        conversationId,
        planId: plan.planId,
        phase: actionResult.success ? 'execute' : 'error',
        input: {
          intentId: action.intentId,
          apiCall: action.apiCall,
        },
        output: actionResult,
        durationMs,
      });
    }

    return {
      planId: plan.planId,
      executedAt: new Date().toISOString(),
      results,
      overallSuccess,
    };
  }

  private async executeAction(
    action: PlannedAction,
  ): Promise<ExecutionActionResult> {
    const fields = action.apiCall.body ?? {};
    const path = action.apiCall.path;

    // Extract PO number and item ID from path
    const poMatch = path.match(/\/purchase-orders\/(\d+)/);
    const itemMatch = path.match(/\/items\/(\d+)/);
    const poNumber = poMatch?.[1];
    const itemId = itemMatch?.[1];

    switch (action.intentId) {
      case 'GET_PURCHASE_ORDER': {
        if (!poNumber)
          return {
            intentId: action.intentId,
            success: false,
            error: 'Missing PO number',
          };
        const result = await this.poService.getById(poNumber);
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true, data: result.data };
      }

      case 'LIST_PURCHASE_ORDERS': {
        const result = await this.poService.getAll(
          fields as Record<string, string>,
        );
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true, data: result.data };
      }

      case 'CREATE_PURCHASE_ORDER': {
        const result = await this.poService.create(
          fields as Parameters<PurchaseOrderService['create']>[0],
        );
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true, data: result.data };
      }

      case 'UPDATE_PO_HEADER': {
        if (!poNumber)
          return {
            intentId: action.intentId,
            success: false,
            error: 'Missing PO number',
          };
        const result = await this.poService.updateHeader(poNumber, fields);
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true, data: result.data };
      }

      case 'UPDATE_PO_ITEM': {
        if (!poNumber || !itemId)
          return {
            intentId: action.intentId,
            success: false,
            error: 'Missing PO number or item ID',
          };
        const result = await this.poService.updateItem(
          poNumber,
          itemId,
          fields,
        );
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true, data: result.data };
      }

      case 'ADD_PO_ITEM': {
        if (!poNumber)
          return {
            intentId: action.intentId,
            success: false,
            error: 'Missing PO number',
          };
        const result = await this.poService.addItem(
          poNumber,
          fields as Parameters<PurchaseOrderService['addItem']>[1],
        );
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true, data: result.data };
      }

      case 'DELETE_PURCHASE_ORDER': {
        if (!poNumber)
          return {
            intentId: action.intentId,
            success: false,
            error: 'Missing PO number',
          };
        const result = await this.poService.delete(poNumber);
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true };
      }

      case 'DELETE_PO_ITEM': {
        if (!poNumber || !itemId)
          return {
            intentId: action.intentId,
            success: false,
            error: 'Missing PO number or item ID',
          };
        const result = await this.poService.deleteItem(poNumber, itemId);
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true };
      }

      case 'GET_PO_ITEMS': {
        if (!poNumber)
          return {
            intentId: action.intentId,
            success: false,
            error: 'Missing PO number',
          };
        const result = await this.poService.getItems(poNumber);
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true, data: result.data };
      }

      case 'GET_PO_ITEM': {
        if (!poNumber || !itemId)
          return {
            intentId: action.intentId,
            success: false,
            error: 'Missing PO number or item ID',
          };
        const result = await this.poService.getItem(poNumber, itemId);
        if (!result.success)
          return {
            intentId: action.intentId,
            success: false,
            error: result.error.message,
          };
        return { intentId: action.intentId, success: true, data: result.data };
      }

      default:
        return {
          intentId: action.intentId,
          success: false,
          error: `Unknown intent: ${action.intentId}`,
        };
    }
  }
}
