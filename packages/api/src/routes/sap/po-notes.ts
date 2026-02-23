import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { PurchaseOrderNoteService } from '../../services/purchase-order-notes/PurchaseOrderNoteService.js';
import {
  CreatePONoteInputSchema,
  UpdatePONoteInputSchema,
  CreatePOItemNoteInputSchema,
  UpdatePOItemNoteInputSchema,
} from '../../services/purchase-order-notes/types.js';
import {
  sapErrorResponses,
  errJson,
  sanitize,
  mapSapStatus,
} from '../../schemas/error.js';

// --- Zod Schemas ---

const PurchaseOrderNoteSchema = z
  .object({
    purchaseOrder: z.string(),
    textObjectType: z.string(),
    language: z.string(),
    plainLongText: z.string().nullable().optional(),
  })
  .openapi('PurchaseOrderNote');

const PurchaseOrderItemNoteSchema = z
  .object({
    purchaseOrder: z.string(),
    purchaseOrderItem: z.string(),
    textObjectType: z.string(),
    language: z.string(),
    plainLongText: z.string().nullable().optional(),
  })
  .openapi('PurchaseOrderItemNote');

// OpenAPI-named wrappers — schemas are defined once in types.ts
const CreateNoteSchema = CreatePONoteInputSchema.openapi('CreatePONoteInput');
const UpdateNoteSchema = UpdatePONoteInputSchema.openapi('UpdatePONoteInput');
const CreateItemNoteSchema = CreatePOItemNoteInputSchema.openapi(
  'CreatePOItemNoteInput',
);
const UpdateItemNoteSchema = UpdatePOItemNoteInputSchema.openapi(
  'UpdatePOItemNoteInput',
);

// --- PO Header Note Routes ---

const listNotesRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/notes',
  tags: ['Purchase Order Notes'],
  summary: 'List notes for a purchase order',
  request: {
    params: z.object({ id: z.string().min(1) }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: z.array(PurchaseOrderNoteSchema),
      }),
      'List of purchase order notes',
    ),
    ...sapErrorResponses,
  },
});

const createNoteRoute = createRoute({
  method: 'post',
  path: '/purchase-orders/{id}/notes',
  tags: ['Purchase Order Notes'],
  summary: 'Create a note on a purchase order',
  request: {
    params: z.object({ id: z.string().min(1) }),
    body: jsonContent(CreateNoteSchema, 'Note to create'),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderNoteSchema }),
      'Created note',
    ),
    ...sapErrorResponses,
  },
});

const getNoteByKeyRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/notes/{textObjectType}/{language}',
  tags: ['Purchase Order Notes'],
  summary: 'Get a specific note by key',
  request: {
    params: z.object({
      id: z.string().min(1),
      textObjectType: z.string().min(1),
      language: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderNoteSchema }),
      'Purchase order note',
    ),
    ...sapErrorResponses,
  },
});

const updateNoteRoute = createRoute({
  method: 'patch',
  path: '/purchase-orders/{id}/notes/{textObjectType}/{language}',
  tags: ['Purchase Order Notes'],
  summary: 'Update a purchase order note',
  request: {
    params: z.object({
      id: z.string().min(1),
      textObjectType: z.string().min(1),
      language: z.string().min(1),
    }),
    body: jsonContent(UpdateNoteSchema, 'Note fields to update'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderNoteSchema }),
      'Updated note',
    ),
    ...sapErrorResponses,
  },
});

const deleteNoteRoute = createRoute({
  method: 'delete',
  path: '/purchase-orders/{id}/notes/{textObjectType}/{language}',
  tags: ['Purchase Order Notes'],
  summary: 'Delete a purchase order note',
  request: {
    params: z.object({
      id: z.string().min(1),
      textObjectType: z.string().min(1),
      language: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true) }),
      'Note deleted',
    ),
    ...sapErrorResponses,
  },
});

// --- PO Item Note Routes ---

const listItemNotesRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/notes',
  tags: ['Purchase Order Item Notes'],
  summary: 'List notes for a purchase order item',
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
        data: z.array(PurchaseOrderItemNoteSchema),
      }),
      'List of item notes',
    ),
    ...sapErrorResponses,
  },
});

const createItemNoteRoute = createRoute({
  method: 'post',
  path: '/purchase-orders/{id}/items/{itemId}/notes',
  tags: ['Purchase Order Item Notes'],
  summary: 'Create a note on a purchase order item',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
    }),
    body: jsonContent(CreateItemNoteSchema, 'Item note to create'),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderItemNoteSchema }),
      'Created item note',
    ),
    ...sapErrorResponses,
  },
});

const getItemNoteByKeyRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}/notes/{textObjectType}/{language}',
  tags: ['Purchase Order Item Notes'],
  summary: 'Get a specific item note by key',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      textObjectType: z.string().min(1),
      language: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderItemNoteSchema }),
      'Item note',
    ),
    ...sapErrorResponses,
  },
});

const updateItemNoteRoute = createRoute({
  method: 'patch',
  path: '/purchase-orders/{id}/items/{itemId}/notes/{textObjectType}/{language}',
  tags: ['Purchase Order Item Notes'],
  summary: 'Update a purchase order item note',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      textObjectType: z.string().min(1),
      language: z.string().min(1),
    }),
    body: jsonContent(UpdateItemNoteSchema, 'Item note fields to update'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderItemNoteSchema }),
      'Updated item note',
    ),
    ...sapErrorResponses,
  },
});

const deleteItemNoteRoute = createRoute({
  method: 'delete',
  path: '/purchase-orders/{id}/items/{itemId}/notes/{textObjectType}/{language}',
  tags: ['Purchase Order Item Notes'],
  summary: 'Delete a purchase order item note',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
      textObjectType: z.string().min(1),
      language: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true) }),
      'Item note deleted',
    ),
    ...sapErrorResponses,
  },
});

// --- Helpers ---

type PONote = z.infer<typeof PurchaseOrderNoteSchema>;
type POItemNote = z.infer<typeof PurchaseOrderItemNoteSchema>;

// --- App ---

const app = new OpenAPIHono();
// Module-level singleton is safe — see PurchaseOrderNoteService.ts for rationale.
const service = new PurchaseOrderNoteService();

// ── PO Header Note Handlers ────────────────────────────────────────

app.openapi(listNotesRoute, async (c) => {
  const { id } = c.req.valid('param');
  const result = await service.getNotes(id);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PONote[]>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(createNoteRoute, async (c) => {
  const { id } = c.req.valid('param');
  const input = c.req.valid('json');
  const result = await service.createNote(id, input);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PONote>(result.data) },
    HttpStatusCodes.CREATED,
  );
});

app.openapi(getNoteByKeyRoute, async (c) => {
  const { id, textObjectType, language } = c.req.valid('param');
  const result = await service.getNoteByKey(id, textObjectType, language);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PONote>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(updateNoteRoute, async (c) => {
  const { id, textObjectType, language } = c.req.valid('param');
  const changes = c.req.valid('json');
  const result = await service.updateNote(
    id,
    textObjectType,
    language,
    changes,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PONote>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(deleteNoteRoute, async (c) => {
  const { id, textObjectType, language } = c.req.valid('param');
  const result = await service.deleteNote(id, textObjectType, language);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json({ success: true as const }, HttpStatusCodes.OK);
});

// ── PO Item Note Handlers ──────────────────────────────────────────

app.openapi(listItemNotesRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const result = await service.getItemNotes(id, itemId);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<POItemNote[]>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(createItemNoteRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const input = c.req.valid('json');
  const result = await service.createItemNote(id, itemId, input);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<POItemNote>(result.data) },
    HttpStatusCodes.CREATED,
  );
});

app.openapi(getItemNoteByKeyRoute, async (c) => {
  const { id, itemId, textObjectType, language } = c.req.valid('param');
  const result = await service.getItemNoteByKey(
    id,
    itemId,
    textObjectType,
    language,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<POItemNote>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(updateItemNoteRoute, async (c) => {
  const { id, itemId, textObjectType, language } = c.req.valid('param');
  const changes = c.req.valid('json');
  const result = await service.updateItemNote(
    id,
    itemId,
    textObjectType,
    language,
    changes,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<POItemNote>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(deleteItemNoteRoute, async (c) => {
  const { id, itemId, textObjectType, language } = c.req.valid('param');
  const result = await service.deleteItemNote(
    id,
    itemId,
    textObjectType,
    language,
  );
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json({ success: true as const }, HttpStatusCodes.OK);
});

export { app as poNotesApp };
