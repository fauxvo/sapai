import { z } from 'zod';

export const CreatePONoteInputSchema = z.object({
  textObjectType: z.string(),
  language: z.string(),
  plainLongText: z.string(),
});

export const UpdatePONoteInputSchema = z.object({
  plainLongText: z.string(),
});

export const CreatePOItemNoteInputSchema = z.object({
  textObjectType: z.string(),
  language: z.string(),
  plainLongText: z.string(),
});

export const UpdatePOItemNoteInputSchema = z.object({
  plainLongText: z.string(),
});

export type CreatePONoteInput = z.infer<typeof CreatePONoteInputSchema>;
export type UpdatePONoteInput = z.infer<typeof UpdatePONoteInputSchema>;
export type CreatePOItemNoteInput = z.infer<typeof CreatePOItemNoteInputSchema>;
export type UpdatePOItemNoteInput = z.infer<typeof UpdatePOItemNoteInputSchema>;
