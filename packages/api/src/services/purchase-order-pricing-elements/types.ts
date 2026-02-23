import { z } from 'zod';

export const UpdatePricingElementInputSchema = z.object({
  conditionRateValue: z.number().optional(),
  conditionCurrency: z.string().optional(),
  conditionQuantity: z.number().optional(),
  conditionQuantityUnit: z.string().optional(),
  priceDetnExchangeRate: z.string().optional(),
  conditionIsManuallyChanged: z.boolean().optional(),
});

export type UpdatePricingElementInput = z.infer<
  typeof UpdatePricingElementInputSchema
>;
