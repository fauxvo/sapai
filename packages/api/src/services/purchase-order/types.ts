import { z } from 'zod';

export const AccountAssignmentInputSchema = z.object({
  category: z.string(),
  costCenter: z.string().optional(),
  glAccount: z.string().optional(),
  wbsElement: z.string().optional(),
});

export const CreatePOItemInputSchema = z.object({
  itemNumber: z.string().optional(),
  material: z.string(),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  plant: z.string(),
  netPrice: z.number().nonnegative(),
  priceUnit: z.number().positive().optional(),
  deliveryDate: z.string(),
  accountAssignment: AccountAssignmentInputSchema.optional(),
});

/** Used when adding an item to an existing PO — itemNumber is required. */
export const AddPOItemInputSchema = CreatePOItemInputSchema.extend({
  itemNumber: z.string(),
});

export const CreatePurchaseOrderInputSchema = z.object({
  companyCode: z.string(),
  orderType: z.string(),
  supplier: z.string(),
  purchasingOrg: z.string(),
  purchasingGroup: z.string(),
  currency: z.string(),
  items: z.array(CreatePOItemInputSchema).min(1),
});

export const UpdatePOHeaderInputSchema = z.object({
  supplier: z.string().optional(),
  paymentTerms: z.string().optional(),
  purchasingGroup: z.string().optional(),
  documentCurrency: z.string().optional(),
  incotermsClassification: z.string().optional(),
  incotermsLocation1: z.string().optional(),
});

export const UpdatePOItemInputSchema = z.object({
  quantity: z.number().positive().optional(),
  netPrice: z.number().nonnegative().optional(),
  plant: z.string().optional(),
  description: z.string().optional(),
});

export const PurchaseOrderFiltersSchema = z.object({
  supplier: z.string().optional(),
  companyCode: z.string().optional(),
  purchasingOrganization: z.string().optional(),
  purchasingGroup: z.string().optional(),
  orderType: z.string().optional(),
  top: z.coerce.number().positive().optional(),
  skip: z.coerce.number().nonnegative().optional(),
});

export type AccountAssignmentInput = z.infer<
  typeof AccountAssignmentInputSchema
>;
export type CreatePOItemInput = z.infer<typeof CreatePOItemInputSchema>;
export type AddPOItemInput = z.infer<typeof AddPOItemInputSchema>;
export type CreatePurchaseOrderInput = z.infer<
  typeof CreatePurchaseOrderInputSchema
>;
export type UpdatePOHeaderInput = z.infer<typeof UpdatePOHeaderInputSchema>;
export type UpdatePOItemInput = z.infer<typeof UpdatePOItemInputSchema>;
export type PurchaseOrderFilters = z.infer<typeof PurchaseOrderFiltersSchema>;
