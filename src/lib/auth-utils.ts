import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = 15;
const PASSWORD_CHANGE_DEADLINE_DAYS = 3;

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return { valid: errors.length === 0, errors };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isPasswordChangeRequired(passwordChangedAt: Date | null): boolean {
  if (!passwordChangedAt) return true;

  const deadline = new Date(passwordChangedAt);
  deadline.setDate(deadline.getDate() + PASSWORD_CHANGE_DEADLINE_DAYS);

  return new Date() > deadline;
}

export function hasRole(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}
