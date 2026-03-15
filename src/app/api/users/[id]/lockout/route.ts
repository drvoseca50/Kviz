import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  handleApiError,
} from "@/lib/api-utils";
import { createAuditLog } from "@/lib/audit-log";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const userId = Number(id);
    if (isNaN(userId)) return apiError("Invalid user ID", 400);

    const actorId = Number(session.user.id);
    const isAdmin = session.user.roles.includes("ADMIN");

    // Check user exists and manager has access
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { id: true, hseBlocked: true, managerId: true },
    });

    if (!user) return apiError("User not found", 404);

    if (!isAdmin && user.managerId !== actorId) {
      return apiError("Forbidden", 403);
    }

    // Toggle unlock (only unlocking is supported from UI)
    const updated = await prisma.userProfile.update({
      where: { id: userId },
      data: { hseBlocked: false },
      select: { id: true, username: true, hseBlocked: true },
    });

    await createAuditLog(actorId, "UNLOCK_HSE", "USER_PROFILE", userId);

    return apiResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
