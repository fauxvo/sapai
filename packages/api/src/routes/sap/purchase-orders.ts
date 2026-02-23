import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import jsonContent from 'stoker/openapi/helpers/json-content';
import { PurchaseOrderService } from '../../services/purchase-order/PurchaseOrderService.js';
import {
  AddPOItemInputSchema,
  CreatePurchaseOrderInputSchema,
  UpdatePOHeaderInputSchema,
  UpdatePOItemInputSchema,
  PurchaseOrderFiltersSchema,
} from '../../services/purchase-order/types.js';
import {
  sapErrorResponses,
  errJson,
  sanitize,
  mapSapStatus,
} from '../../schemas/error.js';

// --- Zod Schemas ---

const PurchaseOrderItemSchema = z
  .object({
    purchaseOrder: z.string(),
    purchaseOrderItem: z.string(),
    purchasingDocumentDeletionCode: z.string().nullable().optional(),
    purchaseOrderItemText: z.string().nullable().optional(),
    plant: z.string().nullable().optional(),
    storageLocation: z.string().nullable().optional(),
    materialGroup: z.string().nullable().optional(),
    material: z.string().nullable().optional(),
    supplierMaterialNumber: z.string().nullable().optional(),
    orderQuantity: z.number().nullable().optional(),
    purchaseOrderQuantityUnit: z.string().nullable().optional(),
    orderPriceUnit: z.string().nullable().optional(),
    netPriceAmount: z.number().nullable().optional(),
    netPriceQuantity: z.number().nullable().optional(),
    documentCurrency: z.string().nullable().optional(),
    taxCode: z.string().nullable().optional(),
    purchaseOrderItemCategory: z.string().nullable().optional(),
    accountAssignmentCategory: z.string().nullable().optional(),
    goodsReceiptIsExpected: z.boolean().nullable().optional(),
    invoiceIsExpected: z.boolean().nullable().optional(),
    invoiceIsGoodsReceiptBased: z.boolean().nullable().optional(),
    purchaseContract: z.string().nullable().optional(),
    purchaseContractItem: z.string().nullable().optional(),
    isCompletelyDelivered: z.boolean().nullable().optional(),
    isFinallyInvoiced: z.boolean().nullable().optional(),
    purchaseRequisition: z.string().nullable().optional(),
    purchaseRequisitionItem: z.string().nullable().optional(),
    isReturnsItem: z.boolean().nullable().optional(),
    requisitionerName: z.string().nullable().optional(),
    incotermsClassification: z.string().nullable().optional(),
    incotermsTransferLocation: z.string().nullable().optional(),
  })
  .openapi('PurchaseOrderItem');

const PurchaseOrderSchema = z
  .object({
    purchaseOrder: z.string(),
    companyCode: z.string().nullable().optional(),
    purchaseOrderType: z.string().nullable().optional(),
    supplier: z.string().nullable().optional(),
    purchasingOrganization: z.string().nullable().optional(),
    purchasingGroup: z.string().nullable().optional(),
    purchaseOrderDate: z.string().nullable().optional(),
    documentCurrency: z.string().nullable().optional(),
    paymentTerms: z.string().nullable().optional(),
    createdByUser: z.string().nullable().optional(),
    creationDate: z.string().nullable().optional(),
    toPurchaseOrderItem: z.array(PurchaseOrderItemSchema).optional(),
  })
  .openapi('PurchaseOrder');

// OpenAPI-named wrappers — schemas are defined once in types.ts
const CreatePOInputSchema = CreatePurchaseOrderInputSchema.openapi(
  'CreatePurchaseOrderInput',
);
const AddItemInputSchema = AddPOItemInputSchema.openapi(
  'AddPurchaseOrderItemInput',
);
const UpdateHeaderInputSchema = UpdatePOHeaderInputSchema.openapi(
  'UpdatePurchaseOrderHeaderInput',
);
const UpdateItemInputSchema = UpdatePOItemInputSchema.openapi(
  'UpdatePurchaseOrderItemInput',
);

// --- Routes ---

const listRoute = createRoute({
  method: 'get',
  path: '/purchase-orders',
  tags: ['Purchase Orders'],
  summary: 'List purchase orders',
  request: {
    query: PurchaseOrderFiltersSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: z.array(PurchaseOrderSchema),
      }),
      'List of purchase orders',
    ),
    ...sapErrorResponses,
  },
});

const getByIdRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}',
  tags: ['Purchase Orders'],
  summary: 'Get purchase order by ID',
  request: {
    params: z.object({ id: z.string().min(1) }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderSchema }),
      'Purchase order with items',
    ),
    ...sapErrorResponses,
  },
});

const createPORoute = createRoute({
  method: 'post',
  path: '/purchase-orders',
  tags: ['Purchase Orders'],
  summary: 'Create purchase order with deep insert',
  request: {
    body: jsonContent(CreatePOInputSchema, 'Purchase order to create'),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderSchema }),
      'Created purchase order',
    ),
    ...sapErrorResponses,
  },
});

const updateHeaderRoute = createRoute({
  method: 'patch',
  path: '/purchase-orders/{id}',
  tags: ['Purchase Orders'],
  summary: 'Update purchase order header',
  request: {
    params: z.object({ id: z.string().min(1) }),
    body: jsonContent(UpdateHeaderInputSchema, 'Header fields to update'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderSchema }),
      'Updated purchase order',
    ),
    ...sapErrorResponses,
  },
});

const deletePORoute = createRoute({
  method: 'delete',
  path: '/purchase-orders/{id}',
  tags: ['Purchase Orders'],
  summary: 'Delete purchase order (soft delete)',
  request: {
    params: z.object({ id: z.string().min(1) }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true) }),
      'Purchase order deleted',
    ),
    ...sapErrorResponses,
  },
});

const listItemsRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items',
  tags: ['Purchase Orders'],
  summary: 'List items for a purchase order',
  request: {
    params: z.object({ id: z.string().min(1) }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.literal(true),
        data: z.array(PurchaseOrderItemSchema),
      }),
      'List of purchase order items',
    ),
    ...sapErrorResponses,
  },
});

const getItemRoute = createRoute({
  method: 'get',
  path: '/purchase-orders/{id}/items/{itemId}',
  tags: ['Purchase Orders'],
  summary: 'Get purchase order item by ID',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderItemSchema }),
      'Purchase order item',
    ),
    ...sapErrorResponses,
  },
});

const addItemRoute = createRoute({
  method: 'post',
  path: '/purchase-orders/{id}/items',
  tags: ['Purchase Orders'],
  summary: 'Add item to existing purchase order',
  request: {
    params: z.object({ id: z.string().min(1) }),
    body: jsonContent(AddItemInputSchema, 'Item to add'),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderItemSchema }),
      'Created item',
    ),
    ...sapErrorResponses,
  },
});

const updateItemRoute = createRoute({
  method: 'patch',
  path: '/purchase-orders/{id}/items/{itemId}',
  tags: ['Purchase Orders'],
  summary: 'Update purchase order item',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
    }),
    body: jsonContent(UpdateItemInputSchema, 'Item fields to update'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true), data: PurchaseOrderItemSchema }),
      'Updated item',
    ),
    ...sapErrorResponses,
  },
});

const deleteItemRoute = createRoute({
  method: 'delete',
  path: '/purchase-orders/{id}/items/{itemId}',
  tags: ['Purchase Orders'],
  summary: 'Delete purchase order item',
  request: {
    params: z.object({
      id: z.string().min(1),
      itemId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.literal(true) }),
      'Item deleted',
    ),
    ...sapErrorResponses,
  },
});

// --- Helpers ---

type PO = z.infer<typeof PurchaseOrderSchema>;
type POItem = z.infer<typeof PurchaseOrderItemSchema>;

// --- App ---

const app = new OpenAPIHono();
// Module-level singleton is safe — see PurchaseOrderService.ts for rationale.
const service = new PurchaseOrderService();

app.openapi(listRoute, async (c) => {
  const result = await service.getAll(c.req.valid('query'));
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PO[]>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(getByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const result = await service.getById(id);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PO>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(createPORoute, async (c) => {
  const input = c.req.valid('json');
  const result = await service.create(input);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PO>(result.data) },
    HttpStatusCodes.CREATED,
  );
});

app.openapi(updateHeaderRoute, async (c) => {
  const { id } = c.req.valid('param');
  const changes = c.req.valid('json');
  const result = await service.updateHeader(id, changes);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<PO>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(deletePORoute, async (c) => {
  const { id } = c.req.valid('param');
  const result = await service.delete(id);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json({ success: true as const }, HttpStatusCodes.OK);
});

app.openapi(listItemsRoute, async (c) => {
  const { id } = c.req.valid('param');
  const result = await service.getItems(id);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<POItem[]>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(getItemRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const result = await service.getItem(id, itemId);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<POItem>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(addItemRoute, async (c) => {
  const { id } = c.req.valid('param');
  const input = c.req.valid('json');
  const result = await service.addItem(id, input);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<POItem>(result.data) },
    HttpStatusCodes.CREATED,
  );
});

app.openapi(updateItemRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const changes = c.req.valid('json');
  const result = await service.updateItem(id, itemId, changes);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json(
    { success: true as const, data: sanitize<POItem>(result.data) },
    HttpStatusCodes.OK,
  );
});

app.openapi(deleteItemRoute, async (c) => {
  const { id, itemId } = c.req.valid('param');
  const result = await service.deleteItem(id, itemId);
  if (!result.success) {
    return c.json(errJson(result.error), mapSapStatus(result.error));
  }
  return c.json({ success: true as const }, HttpStatusCodes.OK);
});

export { app as purchaseOrderApp };
