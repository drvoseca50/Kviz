import { z } from "zod";

export const createHseGroupSchema = z.object({
  id: z.string().min(1, "ID is required").max(200),
  name: z.string().min(1, "Name is required").max(500),
  program: z.string().min(1, "Program is required").max(200),
  riskPriority: z.number().int().optional().nullable(),
  minQuestionCountHse: z.number().int().optional().nullable(),
  totalQuestionCountHse: z.number().int().optional().nullable(),
});

export const updateHseGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(500).optional(),
  program: z.string().min(1, "Program is required").max(200).optional(),
  riskPriority: z.number().int().optional().nullable(),
  minQuestionCountHse: z.number().int().optional().nullable(),
  totalQuestionCountHse: z.number().int().optional().nullable(),
});

export type CreateHseGroupInput = z.infer<typeof createHseGroupSchema>;
export type UpdateHseGroupInput = z.infer<typeof updateHseGroupSchema>;
