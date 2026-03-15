import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { assignRoleSchema } from "@/lib/validations/user";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;

    const roles = await prisma.userProfileRole.findMany({
      where: { userProfileId: Number(id) },
      include: { role: true },
    });

    return apiResponse(roles.map((r) => r.role));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const userId = Number(id);
    const data = await parseBody(request, assignRoleSchema);

    const user = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (!user) {
      return apiError("User not found", 404);
    }

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) {
      return apiError("Role not found", 404);
    }

    const existing = await prisma.userProfileRole.findUnique({
      where: { userProfileId_roleId: { userProfileId: userId, roleId: data.roleId } },
    });

    if (existing) {
      return apiError("User already has this role", 400);
    }

    await prisma.userProfileRole.create({
      data: { userProfileId: userId, roleId: data.roleId },
    });

    await createAuditLog(
      Number(session.user.id),
      "ASSIGN_ROLE",
      "USER_PROFILE",
      userId
    );

    return apiResponse({ message: `Role ${role.name} assigned` }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const userId = Number(id);

    const url = new URL(request.url);
    const roleId = url.searchParams.get("roleId");

    if (!roleId) {
      return apiError("roleId query parameter is required", 400);
    }

    const existing = await prisma.userProfileRole.findUnique({
      where: { userProfileId_roleId: { userProfileId: userId, roleId: Number(roleId) } },
    });

    if (!existing) {
      return apiError("User does not have this role", 404);
    }

    await prisma.userProfileRole.delete({
      where: { userProfileId_roleId: { userProfileId: userId, roleId: Number(roleId) } },
    });

    await createAuditLog(
      Number(session.user.id),
      "REVOKE_ROLE",
      "USER_PROFILE",
      userId
    );

    return apiResponse({ message: "Role revoked" });
  } catch (error) {
    return handleApiError(error);
  }
}
