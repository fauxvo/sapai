import { z } from 'zod';

export const CreateScheduleLineInputSchema = z.object({
  scheduleLine: z.string().optional(),
  delivDateCategory: z.string().optional(),
  scheduleLineDeliveryDate: z.string().optional(),
  purchaseOrderQuantityUnit: z.string().optional(),
  scheduleLineOrderQuantity: z.number().optional(),
  scheduleLineDeliveryTime: z.string().optional(),
  performancePeriodStartDate: z.string().optional(),
  performancePeriodEndDate: z.string().optional(),
});

export const UpdateScheduleLineInputSchema = z.object({
  delivDateCategory: z.string().optional(),
  scheduleLineDeliveryDate: z.string().optional(),
  scheduleLineOrderQuantity: z.number().optional(),
  scheduleLineDeliveryTime: z.string().optional(),
  schedLineStscDeliveryDate: z.string().optional(),
  performancePeriodStartDate: z.string().optional(),
  performancePeriodEndDate: z.string().optional(),
});

export const UpdateSubcontractingComponentInputSchema = z.object({
  requiredQuantity: z.number().optional(),
  quantityInEntryUnit: z.number().optional(),
  requirementDate: z.string().optional(),
  plant: z.string().optional(),
  batch: z.string().optional(),
});

export type CreateScheduleLineInput = z.infer<
  typeof CreateScheduleLineInputSchema
>;
export type UpdateScheduleLineInput = z.infer<
  typeof UpdateScheduleLineInputSchema
>;
export type UpdateSubcontractingComponentInput = z.infer<
  typeof UpdateSubcontractingComponentInputSchema
>;
