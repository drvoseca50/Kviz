import { z } from "zod";

export const createClusterSchema = z.object({
  name: z.string().min(1, "Name is required").max(1000),
  type: z.enum(["PROFESSIONAL", "HSE"]).optional().nullable(),
});

export const updateClusterSchema = z.object({
  name: z.string().min(1, "Name is required").max(1000).optional(),
  type: z.enum(["PROFESSIONAL", "HSE"]).optional().nullable(),
});

export const createFamilySchema = z.object({
  name: z.string().min(1, "Name is required").max(1000),
  type: z.enum(["PROFESSIONAL", "HSE"]).optional().nullable(),
  clusterId: z.number().int().positive("Cluster is required"),
});

export const updateFamilySchema = z.object({
  name: z.string().min(1, "Name is required").max(1000).optional(),
  type: z.enum(["PROFESSIONAL", "HSE"]).optional().nullable(),
  clusterId: z.number().int().positive().optional(),
});

export const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(1000),
  type: z.enum(["PROFESSIONAL", "HSE"]).optional().nullable(),
  familyId: z.number().int().positive("Family is required"),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(1000).optional(),
  type: z.enum(["PROFESSIONAL", "HSE"]).optional().nullable(),
  familyId: z.number().int().positive().optional(),
});

export const createCompetenceSchema = z.object({
  name: z.string().min(1, "Name is required").max(3000),
  description: z.string().max(3000).optional().nullable(),
  type: z.enum(["PROFESSIONAL", "HSE"]),
  indicatorLevel: z.number().int().optional().nullable(),
  indicatorName: z.string().max(3000).optional().nullable(),
  passingIndicator: z.number().int().optional().nullable(),
  competenceGroupId: z.string().min(1, "Group is required"),
  responsibleManagerId: z.number().int().optional().nullable(),
});

export const updateCompetenceSchema = z.object({
  name: z.string().min(1).max(3000).optional(),
  description: z.string().max(3000).optional().nullable(),
  type: z.enum(["PROFESSIONAL", "HSE"]).optional(),
  indicatorLevel: z.number().int().optional().nullable(),
  indicatorName: z.string().max(3000).optional().nullable(),
  passingIndicator: z.number().int().optional().nullable(),
  competenceGroupId: z.string().min(1).optional(),
  responsibleManagerId: z.number().int().optional().nullable(),
});

export type CreateClusterInput = z.infer<typeof createClusterSchema>;
export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateCompetenceInput = z.infer<typeof createCompetenceSchema>;
