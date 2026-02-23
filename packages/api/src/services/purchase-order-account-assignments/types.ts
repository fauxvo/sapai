import { z } from 'zod';

export const CreateAccountAssignmentInputSchema = z.object({
  accountAssignmentNumber: z.string().optional(),
  glAccount: z.string().optional(),
  costCenter: z.string().optional(),
  wbsElement: z.string().optional(),
  orderId: z.string().optional(),
  profitCenter: z.string().optional(),
  businessArea: z.string().optional(),
  functionalArea: z.string().optional(),
  fund: z.string().optional(),
  fundsCenter: z.string().optional(),
  quantity: z.number().optional(),
  multipleAcctAssgmtDistrPercent: z.number().optional(),
  masterFixedAsset: z.string().optional(),
  fixedAsset: z.string().optional(),
  projectNetwork: z.string().optional(),
  networkActivity: z.string().optional(),
  taxCode: z.string().optional(),
  settlementReferenceDate: z.string().optional(),
});

export const UpdateAccountAssignmentInputSchema = z.object({
  glAccount: z.string().optional(),
  costCenter: z.string().optional(),
  wbsElement: z.string().optional(),
  orderId: z.string().optional(),
  profitCenter: z.string().optional(),
  businessArea: z.string().optional(),
  functionalArea: z.string().optional(),
  fund: z.string().optional(),
  fundsCenter: z.string().optional(),
  quantity: z.number().optional(),
  multipleAcctAssgmtDistrPercent: z.number().optional(),
  masterFixedAsset: z.string().optional(),
  fixedAsset: z.string().optional(),
  projectNetwork: z.string().optional(),
  networkActivity: z.string().optional(),
  taxCode: z.string().optional(),
  settlementReferenceDate: z.string().optional(),
});

export type CreateAccountAssignmentInput = z.infer<
  typeof CreateAccountAssignmentInputSchema
>;
export type UpdateAccountAssignmentInput = z.infer<
  typeof UpdateAccountAssignmentInputSchema
>;
