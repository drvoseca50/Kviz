import { z } from "zod";

export const createPositionSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  hseGroupId: z.string().max(200).optional().nullable(),
});

export const updatePositionSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  hseGroupId: z.string().max(200).optional().nullable(),
});

export const updatePositionCompetencesSchema = z.object({
  competenceIds: z.array(z.string()),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
export type UpdatePositionCompetencesInput = z.infer<typeof updatePositionCompetencesSchema>;
