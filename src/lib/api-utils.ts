import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ZodError, type ZodType } from "zod";

export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function getSession() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new ApiAuthError("Unauthorized");
  }
  return session;
}

export async function requireRole(...roles: string[]) {
  const session = await requireAuth();
  const userRoles = session.user.roles ?? [];
  const hasAccess = roles.some((role) => userRoles.includes(role));
  if (!hasAccess) {
    throw new ApiForbiddenError("Forbidden");
  }
  return session;
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiAuthError) {
    return apiError(error.message, 401);
  }
  if (error instanceof ApiForbiddenError) {
    return apiError(error.message, 403);
  }
  if (error instanceof ZodError) {
    const messages = error.issues.map((i) => i.message).join(". ");
    return apiError(messages, 400);
  }
  console.error("API error:", error);
  return apiError("Internal server error", 500);
}

class ApiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiAuthError";
  }
}

class ApiForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiForbiddenError";
  }
}
