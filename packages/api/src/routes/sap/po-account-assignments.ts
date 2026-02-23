import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { PurchaseOrderAccountAssignmentService } from '../../services/purchase-order-account-assignments/PurchaseOrderAccountAssignmentService.js';
import {
  CreateAccountAssignmentInputSchema as BaseCreateAASchema,
  UpdateAccountAssignmentInputSchema as BaseUpdateAASchema,
} from '../../services/purchase-order-account-assignments/types.js';
import {
  sapErrorResponses,
  errJson,
  sanitize,
  mapSapStatus,
} from '../../schemas/error.js';

// --- Zod Schemas ---

const PurOrdAccountAssignmentSchema = z
  .object({
    purchaseOrder: z.string(),
    purchaseOrderItem: z.string(),
    accountAssignmentNumber: z.string(),
    isDeleted: z.boolean().nullable().optional(),
    purchaseOrderQuantityUnit: z.string().nullable().optional(),
    quantity: z.number().nullable().optional(),
    multipleAcctAssgmtDistrPercent: z.number().nullable().optional(),
    documentCurrency: z.string().nullable().optional(),
    purgDocNetAmount: z.number().nullable().optional(),
    glAccount: z.string().nullable().optional(),
    businessArea: z.string().nullable().optional(),
    costCenter: z.string().nullable().optional(),
    salesOrder: z.string().nullable().optional(),
    salesOrderItem: z.string().nullable().optional(),
    salesOrderScheduleLine: z.string().nullable().optional(),
    masterFixedAsset: z.string().nullable().optional(),
    fixedAsset: z.string().nullable().optional(),
    goodsRecipientName: z.string().nullable().optional(),
    unloadingPointName: z.string().nullable().optional(),
    controllingArea: z.string().nullable().optional(),
    costObject: z.string().nullable().optional(),
    orderId: z.string().nullable().optional(),
    profitCenter: z.string().nullable().optional(),
    wbsElementInternalId: z.string().nullable().optional(),
    wbsElement: z.string().nullable().optional(),
    wbsElementExternalId: z.string().nullable().optional(),
    projectNetwork: z.string().nullable().optional(),
    networkActivity: z.string().nullable().optional(),
    realEstateObject: z.string().nullable().optional(),
    partnerAccountNumber: z.string().nullable().optional(),
    commitmentItem: z.string().nullable().optional(),
    jointVentureRecoveryCode: z.string().nullable().optional(),
    fundsCenter: z.string().nullable().optional(),
    fund: z.string().nullable().optional(),
    functionalArea: z.string().nullable().optional(),
    settlementReferenceDate: z.string().nullable().optional(),
    taxCode: z.string().nullable().optional(),
    taxJurisdiction: z.string().nullable().optional(),
    costCtrActivityType: z.string().nullable().optional(),
    businessProcess: z.string().nullable().optional(),
    earmarkedFundsDocument: z.string().nullable().optional(),
    earmarkedFundsDocumentItem: z.string().nullable().optional(),
    grantId: z.string().nullable().optional(),
    budgetPeriod: z.string().nullable().optional(),
  })
  .openapi('PurOrdAccountAssignment');

// Date/time validation refinements applied at the API boundary.
// Base schemas (without validation) live in types.ts for service-layer use.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format');

const CreateAccountAssignmentInputSchema = BaseCreateAASchema.extend({
  settlementReferenceDate: isoDate.optional(),
}).openapi('CreateAccountAssignmentInput');

const UpdateAccountAssignmentInputSchema = BaseUpdateAASchema.extend({
  settlementReferenceDate: isoDate.optional(),
}).openapi('UpdateAccountAssignmentInput');

// --- Routes ---

const listAccountAssignmentsRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/account-assignments',
  tags: ['Account Assignments'],
  summary: 'List account assignments for a PO item',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: z.array(PurOrdAccountAssignmentSchema),
      }),
      'List of account assignments',
    ),
    ...sapErrorResponses,
  },
});

const createAccountAssignmentRoute = createRoute({
  method: 'post',
  path: '/purchase-orders/{id}/items/{itemId}/account-assignments',
  tags: ['Account Assignments'],
  summary: 'Create account assignment on a PO item',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
    }),
    body: jsonContent(
      CreateAccountAssignmentInputSchema,
      'Account assignment to create',
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PurOrdAccountAssignmentSchema,
      }),
      'Created account assignment',
    ),
    ...sapErrorResponses,
  },
});

const getAccountAssignmentByKeyRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/account-assignments/{assignmentNum}',
  tags: ['Account Assignments'],
  summary: 'Get account assignment by key',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      assignmentNum: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PurOrdAccountAssignmentSchema,
      }),
      'Account assignment',
    ),
    ...sapErrorResponses,
  },
});

const updateAccountAssignmentRoute = createRoute({
  method: 'patch',
  path: '/purchase-orders/{id}/items/{itemId}/account-assignments/{assignmentNum}',
  tags: ['Account Assignments'],
  summary: 'Update account assignment',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      assignmentNum: z.string().min(1),
    }),
    body: jsonContent(
      UpdateAccountAssignmentInputSchema,
      'Account assignment fields to update',
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PurOrdAccountAssignmentSchema,
      }),
      'Updated account assignment',
    ),
    ...sapErrorResponses,
  },
});

const deleteAccountAssignmentRoute = createRoute({
  method: 'delete',
  path: '/purchase-orders/{id}/items/{itemId}/account-assignments/{assignmentNum}',
  tags: ['Account Assignments'],
  summary: 'Delete account assignment',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      assignmentNum: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true) }),
      'Account assignment deleted',
    ),
    ...sapErrorResponses,
  },
});

// --- Helpers ---

type AccountAssignment = z.infer<typeof PurOrdAccountAssignmentSchema>;

// --- App ---

const app = new OpenAPIHono();
// Module-level singleton is safe — see PurchaseOrderAccountAssignmentService.ts for rationale.
const service = new PurchaseOrderAccountAssignmentService();

app.openapi(listAccountAssignmentsRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const result = await service.getAccountAssignments(id, itemId);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    {
      success: true as const,
      data: sanitize<AccountAssignment[]>(result.data),
    },
    HttpStatusCodes.OK,
  );
});

app.openapi(createAccountAssignmentRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const input = c.req.valid('json');
  const result = await service.createAccountAssignment(id, itemId, input);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<AccountAssignment>(result.data) },
    HttpStatusCodes.CREATED,
  );
});

app.openapi(getAccountAssignmentByKeyRoute, async (c) => {
  const { id, itemId, assignmentNum } = c.req.valid('param');
  const result = await service.getAccountAssignmentByKey(
    id,
    itemId,
    assignmentNum,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<AccountAssignment>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(updateAccountAssignmentRoute, async (c) => {
  const { id, itemId, assignmentNum } = c.req.valid('param');
  const changes = c.req.valid('json');
  const result = await service.updateAccountAssignment(
    id,
    itemId,
    assignmentNum,
    changes,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<AccountAssignment>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(deleteAccountAssignmentRoute, async (c) => {
  const { id, itemId, assignmentNum } = c.req.valid('param');
  const result = await service.deleteAccountAssignment(
    id,
    itemId,
    assignmentNum,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json({ success: true as const }, HttpStatusCodes.OK);
});

export { app as poAccountAssignmentsApp };
