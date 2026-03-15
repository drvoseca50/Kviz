import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updateUserSchema } from "@/lib/validations/user";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const userId = Number(id);
    const currentUserId = Number(session.user.id);
    const isAdmin = session.user.roles.includes("ADMIN");

    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        lastNameFirstName: true,
        sapId: true,
        phone: true,
        imagePath: true,
        startDate: true,
        endDate: true,
        hseBlocked: true,
        passwordChangedAt: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        positionId: true,
        position: { select: { id: true, name: true } },
        organisationalUnitId: true,
        organisationalUnit: { select: { id: true, name: true } },
        managerId: true,
        manager: { select: { id: true, username: true, lastNameFirstName: true } },
        hseManagerId: true,
        hseManager: { select: { id: true, username: true, lastNameFirstName: true } },
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    // MANAGER can only view their own employees
    if (!isAdmin && user.managerId !== currentUserId) {
      return apiError("Forbidden", 403);
    }

    return apiResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const userId = Number(id);
    const currentUserId = Number(session.user.id);
    const isAdmin = session.user.roles.includes("ADMIN");

    const existing = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      return apiError("User not found", 404);
    }

    if (!isAdmin && existing.managerId !== currentUserId) {
      return apiError("Forbidden", 403);
    }

    const data = await parseBody(request, updateUserSchema);

    const user = await prisma.userProfile.update({
      where: { id: userId },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.lastNameFirstName !== undefined && { lastNameFirstName: data.lastNameFirstName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.positionId !== undefined && { positionId: data.positionId }),
        ...(data.organisationalUnitId !== undefined && { organisationalUnitId: data.organisationalUnitId }),
        ...(data.managerId !== undefined && { managerId: data.managerId }),
        ...(data.hseManagerId !== undefined && { hseManagerId: data.hseManagerId }),
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "UPDATE",
      "USER_PROFILE",
      user.id
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = user as Record<string, unknown>;
    return apiResponse(userWithoutPassword);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const userId = Number(id);

    const existing = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      return apiError("User not found", 404);
    }

    // Soft delete: set end_date
    await prisma.userProfile.update({
      where: { id: userId },
      data: { endDate: new Date() },
    });

    await createAuditLog(
      Number(session.user.id),
      "DELETE",
      "USER_PROFILE",
      userId
    );

    return apiResponse({ message: "User deactivated" });
  } catch (error) {
    return handleApiError(error);
  }
}
