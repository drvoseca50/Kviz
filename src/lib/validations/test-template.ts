import { z } from "zod";

export const createTestTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(500),
});

export const updateTestTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(500).optional(),
});

export const setTemplateCompetencesSchema = z.object({
  competences: z.array(
    z.object({
      competenceId: z.string().min(1),
      numberOfQuestions: z.number().int().min(1, "At least 1 question required"),
    })
  ),
});

export const setCompetenceEqualitySchema = z.object({
  equalities: z.array(
    z.object({
      competenceId: z.string().min(1),
      isNumOfQuestionPerLevelEqual: z.boolean(),
    })
  ),
});

export const generateTestSchema = z.object({
  testTemplateId: z.number().int(),
  name: z.string().min(1, "Test name is required").max(300),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["HSE", "TECHNICAL"]),
  totalTime: z.number().int().positive().optional().nullable(),
  hseGroupId: z.string().optional().nullable(),
});

export const assignTestSchema = z.object({
  userIds: z.array(z.number().int()).min(1, "At least one user required"),
});

export type CreateTestTemplateInput = z.infer<typeof createTestTemplateSchema>;
export type UpdateTestTemplateInput = z.infer<typeof updateTestTemplateSchema>;
export type SetTemplateCompetencesInput = z.infer<typeof setTemplateCompetencesSchema>;
export type SetCompetenceEqualityInput = z.infer<typeof setCompetenceEqualitySchema>;
export type GenerateTestInput = z.infer<typeof generateTestSchema>;
export type AssignTestInput = z.infer<typeof assignTestSchema>;
