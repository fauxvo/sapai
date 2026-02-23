import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { PurchaseOrderScheduleLineService } from '../../services/purchase-order-schedule-lines/PurchaseOrderScheduleLineService.js';
import {
  CreateScheduleLineInputSchema as BaseCreateSLSchema,
  UpdateScheduleLineInputSchema as BaseUpdateSLSchema,
  UpdateSubcontractingComponentInputSchema as BaseUpdateCompSchema,
} from '../../services/purchase-order-schedule-lines/types.js';
import {
  sapErrorResponses,
  errJson,
  sanitize,
  mapSapStatus,
} from '../../schemas/error.js';

// --- Zod Schemas ---

const PurchaseOrderScheduleLineSchema = z
  .object({
    purchasingDocument: z.string(),
    purchasingDocumentItem: z.string(),
    scheduleLine: z.string(),
    delivDateCategory: z.string().nullable().optional(),
    scheduleLineDeliveryDate: z.string().nullable().optional(),
    purchaseOrderQuantityUnit: z.string().nullable().optional(),
    scheduleLineOrderQuantity: z.number().nullable().optional(),
    scheduleLineDeliveryTime: z.string().nullable().optional(),
    schedLineStscDeliveryDate: z.string().nullable().optional(),
    purchaseRequisition: z.string().nullable().optional(),
    purchaseRequisitionItem: z.string().nullable().optional(),
    scheduleLineCommittedQuantity: z.number().nullable().optional(),
    performancePeriodStartDate: z.string().nullable().optional(),
    performancePeriodEndDate: z.string().nullable().optional(),
  })
  .openapi('PurchaseOrderScheduleLine');

const PoSubcontractingComponentSchema = z
  .object({
    purchaseOrder: z.string(),
    purchaseOrderItem: z.string(),
    scheduleLine: z.string(),
    reservationItem: z.string(),
    recordType: z.string(),
    material: z.string().nullable().optional(),
    bomItemDescription: z.string().nullable().optional(),
    requiredQuantity: z.number().nullable().optional(),
    baseUnit: z.string().nullable().optional(),
    requirementDate: z.string().nullable().optional(),
    quantityInEntryUnit: z.number().nullable().optional(),
    entryUnit: z.string().nullable().optional(),
    withdrawnQuantity: z.number().nullable().optional(),
    plant: z.string().nullable().optional(),
    batch: z.string().nullable().optional(),
    requirementSegment: z.string().nullable().optional(),
  })
  .openapi('PoSubcontractingComponent');

// Date/time validation refinements applied at the API boundary.
// Base schemas (without validation) live in types.ts for service-layer use.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format');

const timeHHMMSS = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Expected HH:MM or HH:MM:SS format');

const CreateScheduleLineInputSchema = BaseCreateSLSchema.extend({
  scheduleLineDeliveryDate: isoDate.optional(),
  scheduleLineDeliveryTime: timeHHMMSS.optional(),
  performancePeriodStartDate: isoDate.optional(),
  performancePeriodEndDate: isoDate.optional(),
}).openapi('CreateScheduleLineInput');

const UpdateScheduleLineInputSchema = BaseUpdateSLSchema.extend({
  scheduleLineDeliveryDate: isoDate.optional(),
  scheduleLineDeliveryTime: timeHHMMSS.optional(),
  schedLineStscDeliveryDate: isoDate.optional(),
  performancePeriodStartDate: isoDate.optional(),
  performancePeriodEndDate: isoDate.optional(),
}).openapi('UpdateScheduleLineInput');

const UpdateSubcontractingComponentInputSchema = BaseUpdateCompSchema.extend({
  requirementDate: isoDate.optional(),
}).openapi('UpdateSubcontractingComponentInput');

// --- Route definitions ---

const listScheduleLinesRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/schedule-lines',
  tags: ['Schedule Lines'],
  summary: 'List schedule lines for a PO item',
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
        data: z.array(PurchaseOrderScheduleLineSchema),
      }),
      'List of schedule lines',
    ),
    ...sapErrorResponses,
  },
});

const createScheduleLineRoute = createRoute({
  method: 'post',
  path: '/purchase-orders/{id}/items/{itemId}/schedule-lines',
  tags: ['Schedule Lines'],
  summary: 'Create schedule line for a PO item',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
    }),
    body: jsonContent(CreateScheduleLineInputSchema, 'Schedule line to create'),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PurchaseOrderScheduleLineSchema,
      }),
      'Created schedule line',
    ),
    ...sapErrorResponses,
  },
});

const getScheduleLineRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/schedule-lines/{lineId}',
  tags: ['Schedule Lines'],
  summary: 'Get schedule line by key',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      lineId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PurchaseOrderScheduleLineSchema,
      }),
      'Schedule line',
    ),
    ...sapErrorResponses,
  },
});

const updateScheduleLineRoute = createRoute({
  method: 'patch',
  path: '/purchase-orders/{id}/items/{itemId}/schedule-lines/{lineId}',
  tags: ['Schedule Lines'],
  summary: 'Update schedule line',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      lineId: z.string().min(1),
    }),
    body: jsonContent(
      UpdateScheduleLineInputSchema,
      'Schedule line fields to update',
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PurchaseOrderScheduleLineSchema,
      }),
      'Updated schedule line',
    ),
    ...sapErrorResponses,
  },
});

const deleteScheduleLineRoute = createRoute({
  method: 'delete',
  path: '/purchase-orders/{id}/items/{itemId}/schedule-lines/{lineId}',
  tags: ['Schedule Lines'],
  summary: 'Delete schedule line',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      lineId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true) }),
      'Schedule line deleted',
    ),
    ...sapErrorResponses,
  },
});

const listComponentsRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/schedule-lines/{lineId}/components',
  tags: ['Subcontracting Components'],
  summary: 'List subcontracting components for a schedule line',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      lineId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: z.array(PoSubcontractingComponentSchema),
      }),
      'List of subcontracting components',
    ),
    ...sapErrorResponses,
  },
});

const getComponentRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/schedule-lines/{lineId}/components/{reservationItem}/{recordType}',
  tags: ['Subcontracting Components'],
  summary: 'Get subcontracting component by key',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      lineId: z.string().min(1),
      reservationItem: z.string().min(1),
      recordType: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PoSubcontractingComponentSchema,
      }),
      'Subcontracting component',
    ),
    ...sapErrorResponses,
  },
});

const updateComponentRoute = createRoute({
  method: 'patch',
  path: '/purchase-orders/{id}/items/{itemId}/schedule-lines/{lineId}/components/{reservationItem}/{recordType}',
  tags: ['Subcontracting Components'],
  summary: 'Update subcontracting component',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      lineId: z.string().min(1),
      reservationItem: z.string().min(1),
      recordType: z.string().min(1),
    }),
    body: jsonContent(
      UpdateSubcontractingComponentInputSchema,
      'Component fields to update',
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: PoSubcontractingComponentSchema,
      }),
      'Updated component',
    ),
    ...sapErrorResponses,
  },
});

const deleteComponentRoute = createRoute({
  method: 'delete',
  path: '/purchase-orders/{id}/items/{itemId}/schedule-lines/{lineId}/components/{reservationItem}/{recordType}',
  tags: ['Subcontracting Components'],
  summary: 'Delete subcontracting component',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      lineId: z.string().min(1),
      reservationItem: z.string().min(1),
      recordType: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true) }),
      'Component deleted',
    ),
    ...sapErrorResponses,
  },
});

// --- Helpers ---

type ScheduleLine = z.infer<typeof PurchaseOrderScheduleLineSchema>;
type Component = z.infer<typeof PoSubcontractingComponentSchema>;

// --- App ---

const app = new OpenAPIHono();
// Module-level singleton is safe — see PurchaseOrderScheduleLineService.ts for rationale.
const service = new PurchaseOrderScheduleLineService();

// Schedule Lines

app.openapi(listScheduleLinesRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const result = await service.getScheduleLines(id, itemId);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<ScheduleLine[]>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(createScheduleLineRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const input = c.req.valid('json');
  const result = await service.createScheduleLine(id, itemId, input);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<ScheduleLine>(result.data) },
    HttpStatusCodes.CREATED,
  );
});

app.openapi(getScheduleLineRoute, async (c) => {
  const { id, itemId, lineId } = c.req.valid('param');
  const result = await service.getScheduleLineByKey(id, itemId, lineId);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<ScheduleLine>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(updateScheduleLineRoute, async (c) => {
  const { id, itemId, lineId } = c.req.valid('param');
  const changes = c.req.valid('json');
  const result = await service.updateScheduleLine(id, itemId, lineId, changes);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<ScheduleLine>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(deleteScheduleLineRoute, async (c) => {
  const { id, itemId, lineId } = c.req.valid('param');
  const result = await service.deleteScheduleLine(id, itemId, lineId);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json({ success: true as const }, HttpStatusCodes.OK);
});

// Subcontracting Components

app.openapi(listComponentsRoute, async (c) => {
  const { id, itemId, lineId } = c.req.valid('param');
  const result = await service.getComponents(id, itemId, lineId);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<Component[]>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(getComponentRoute, async (c) => {
  const { id, itemId, lineId, reservationItem, recordType } =
    c.req.valid('param');
  const result = await service.getComponentByKey(
    id,
    itemId,
    lineId,
    reservationItem,
    recordType,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<Component>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(updateComponentRoute, async (c) => {
  const { id, itemId, lineId, reservationItem, recordType } =
    c.req.valid('param');
  const changes = c.req.valid('json');
  const result = await service.updateComponent(
    id,
    itemId,
    lineId,
    reservationItem,
    recordType,
    changes,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<Component>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(deleteComponentRoute, async (c) => {
  const { id, itemId, lineId, reservationItem, recordType } =
    c.req.valid('param');
  const result = await service.deleteComponent(
    id,
    itemId,
    lineId,
    reservationItem,
    recordType,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json({ success: true as const }, HttpStatusCodes.OK);
});

export { app as poScheduleLinesApp };
