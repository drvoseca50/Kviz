import { z } from "zod";

const passwordSchema = z
  .string()
  .min(15, "Password must be at least 15 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(200)
    .regex(/^[a-zA-Z0-9._-]+$/, "Username can only contain letters, numbers, dots, hyphens, and underscores"),
  email: z.string().email("Invalid email address").max(200).optional().nullable(),
  password: passwordSchema,
  lastNameFirstName: z.string().max(200).optional().nullable(),
  sapId: z.number().int().positive("SAP ID must be a positive number"),
  phone: z.string().max(50).optional().nullable(),
  positionId: z.string().max(255).optional().nullable(),
  organisationalUnitId: z.number().int().positive().optional().nullable(),
  managerId: z.number().int().positive().optional().nullable(),
  hseManagerId: z.number().int().positive().optional().nullable(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").max(200).optional().nullable(),
  lastNameFirstName: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  positionId: z.string().max(255).optional().nullable(),
  organisationalUnitId: z.number().int().positive().optional().nullable(),
  managerId: z.number().int().positive().optional().nullable(),
  hseManagerId: z.number().int().positive().optional().nullable(),
});

export const assignRoleSchema = z.object({
  roleId: z.number().int().positive("Role ID is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
