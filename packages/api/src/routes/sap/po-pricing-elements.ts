import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { PurchaseOrderPricingElementService } from '../../services/purchase-order-pricing-elements/PurchaseOrderPricingElementService.js';
import { UpdatePricingElementInputSchema as BaseUpdatePESchema } from '../../services/purchase-order-pricing-elements/types.js';
import {
  sapErrorResponses,
  errJson,
  sanitize,
  mapSapStatus,
} from '../../schemas/error.js';

// --- Zod Schemas ---

const PurOrdPricingElementSchema = z
  .object({
    purchaseOrder: z.string(),
    purchaseOrderItem: z.string(),
    pricingDocument: z.string(),
    pricingDocumentItem: z.string(),
    pricingProcedureStep: z.string(),
    pricingProcedureCounter: z.string(),
    conditionType: z.string().nullable().optional(),
    conditionRateValue: z.number().nullable().optional(),
    conditionCurrency: z.string().nullable().optional(),
    priceDetnExchangeRate: z.string().nullable().optional(),
    transactionCurrency: z.string().nullable().optional(),
    conditionAmount: z.number().nullable().optional(),
    conditionQuantityUnit: z.string().nullable().optional(),
    conditionQuantity: z.number().nullable().optional(),
    conditionApplication: z.string().nullable().optional(),
    pricingDateTime: z.string().nullable().optional(),
    conditionCalculationType: z.string().nullable().optional(),
    conditionBaseValue: z.number().nullable().optional(),
    conditionToBaseQtyNmrtr: z.number().nullable().optional(),
    conditionToBaseQtyDnmntr: z.number().nullable().optional(),
    conditionCategory: z.string().nullable().optional(),
    conditionIsForStatistics: z.boolean().nullable().optional(),
    pricingScaleType: z.string().nullable().optional(),
    isRelevantForAccrual: z.boolean().nullable().optional(),
    cndnIsRelevantForInvoiceList: z.string().nullable().optional(),
    conditionOrigin: z.string().nullable().optional(),
    isGroupCondition: z.string().nullable().optional(),
    cndnIsRelevantForLimitValue: z.boolean().nullable().optional(),
    conditionSequentialNumber: z.string().nullable().optional(),
    conditionControl: z.string().nullable().optional(),
    conditionInactiveReason: z.string().nullable().optional(),
    conditionClass: z.string().nullable().optional(),
    factorForConditionBasisValue: z.number().nullable().optional(),
    pricingScaleBasis: z.string().nullable().optional(),
    conditionScaleBasisValue: z.number().nullable().optional(),
    conditionScaleBasisCurrency: z.string().nullable().optional(),
    conditionScaleBasisUnit: z.string().nullable().optional(),
    cndnIsRelevantForIntcoBilling: z.boolean().nullable().optional(),
    conditionIsForConfiguration: z.boolean().nullable().optional(),
    conditionIsManuallyChanged: z.boolean().nullable().optional(),
    conditionRecord: z.string().nullable().optional(),
    accessNumberOfAccessSequence: z.string().nullable().optional(),
  })
  .openapi('PurOrdPricingElement');

// OpenAPI-named wrapper — schema is defined once in types.ts
const UpdatePricingElementInputSchema = BaseUpdatePESchema.openapi(
  'UpdatePricingElementInput',
);

// --- Routes ---

const listPricingElementsRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/pricing-elements',
  tags: ['Pricing Elements'],
  summary: 'List pricing elements for a purchase order item',
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
        data: z.array(PurOrdPricingElementSchema),
      }),
      'List of pricing elements',
    ),
    ...sapErrorResponses,
  },
});

const getPricingElementByKeyRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/pricing-elements/{pricingDoc}/{pricingDocItem}/{step}/{counter}',
  tags: ['Pricing Elements'],
  summary: 'Get pricing element by key',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      pricingDoc: z.string().min(1),
      pricingDocItem: z.string().min(1),
      step: z.string().min(1),
      counter: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PurOrdPricingElementSchema,
      }),
      'Pricing element',
    ),
    ...sapErrorResponses,
  },
});

const updatePricingElementRoute = createRoute({
  method: 'patch',
  path: '/purchase-orders/{id}/items/{itemId}/pricing-elements/{pricingDoc}/{pricingDocItem}/{step}/{counter}',
  tags: ['Pricing Elements'],
  summary: 'Update pricing element',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      pricingDoc: z.string().min(1),
      pricingDocItem: z.string().min(1),
      step: z.string().min(1),
      counter: z.string().min(1),
    }),
    body: jsonContent(
      UpdatePricingElementInputSchema,
      'Pricing element fields to update',
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PurOrdPricingElementSchema,
      }),
      'Updated pricing element',
    ),
    ...sapErrorResponses,
  },
});

const deletePricingElementRoute = createRoute({
  method: 'delete',
  path: '/purchase-orders/{id}/items/{itemId}/pricing-elements/{pricingDoc}/{pricingDocItem}/{step}/{counter}',
  tags: ['Pricing Elements'],
  summary: 'Delete pricing element',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      pricingDoc: z.string().min(1),
      pricingDocItem: z.string().min(1),
      step: z.string().min(1),
      counter: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true) }),
      'Pricing element deleted',
    ),
    ...sapErrorResponses,
  },
});

// --- Helpers ---

type PricingElement = z.infer<typeof PurOrdPricingElementSchema>;

// --- App ---

const app = new OpenAPIHono();
// Module-level singleton is safe — see PurchaseOrderPricingElementService.ts for rationale.
const service = new PurchaseOrderPricingElementService();

app.openapi(listPricingElementsRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const result = await service.getPricingElements(id, itemId);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PricingElement[]>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(getPricingElementByKeyRoute, async (c) => {
  const { id, itemId, pricingDoc, pricingDocItem, step, counter } =
    c.req.valid('param');
  const result = await service.getPricingElementByKey(
    id,
    itemId,
    pricingDoc,
    pricingDocItem,
    step,
    counter,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PricingElement>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(updatePricingElementRoute, async (c) => {
  const { id, itemId, pricingDoc, pricingDocItem, step, counter } =
    c.req.valid('param');
  const changes = c.req.valid('json');
  const result = await service.updatePricingElement(
    id,
    itemId,
    pricingDoc,
    pricingDocItem,
    step,
    counter,
    changes,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PricingElement>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(deletePricingElementRoute, async (c) => {
  const { id, itemId, pricingDoc, pricingDocItem, step, counter } =
    c.req.valid('param');
  const result = await service.deletePricingElement(
    id,
    itemId,
    pricingDoc,
    pricingDocItem,
    step,
    counter,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json({ success: true as const }, HttpStatusCodes.OK);
});

export { app as poPricingElementsApp };
