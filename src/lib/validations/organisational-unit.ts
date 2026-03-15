import { z } from "zod";

export const createOrgUnitSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  superiorId: z.number().int().positive().optional().nullable(),
});

export const updateOrgUnitSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  superiorId: z.number().int().positive().optional().nullable(),
});

export type CreateOrgUnitInput = z.infer<typeof createOrgUnitSchema>;
export type UpdateOrgUnitInput = z.infer<typeof updateOrgUnitSchema>;
