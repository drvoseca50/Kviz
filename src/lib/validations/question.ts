import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonArray = z.array(z.any()).min(1);

export const createQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required").max(5000),
  level: z.number().int().min(1, "Level must be at least 1"),
  questionType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "ORDERING", "IMAGE_PLACEMENT"]),
  imagePath: z.string().max(5000).optional().nullable(),
  possibleAnswers: jsonArray,
  correctAnswers: jsonArray,
  answerTime: z.number().int().positive().optional().nullable(),
  competenceId: z.string().min(1, "Competence is required"),
});

export const updateQuestionSchema = z.object({
  text: z.string().min(1).max(5000).optional(),
  level: z.number().int().min(1).optional(),
  questionType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "ORDERING", "IMAGE_PLACEMENT"]).optional(),
  imagePath: z.string().max(5000).optional().nullable(),
  possibleAnswers: z.array(z.any()).min(1).optional(),
  correctAnswers: z.array(z.any()).min(1).optional(),
  answerTime: z.number().int().positive().optional().nullable(),
  competenceId: z.string().min(1).optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
