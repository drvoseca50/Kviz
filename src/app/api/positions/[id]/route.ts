import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updatePositionSchema } from "@/lib/validations/position";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        hseGroup: true,
        competences: { include: { competence: true } },
      },
    });

    if (!position) {
      return apiError("Position not found", 404);
    }

    return apiResponse(position);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, updatePositionSchema);

    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Position not found", 404);
    }

    const position = await prisma.position.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.hseGroupId !== undefined && { hseGroupId: data.hseGroupId }),
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "UPDATE",
      "POSITION",
      position.id
    );

    return apiResponse(position);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;

    const existing = await prisma.position.findUnique({
      where: { id },
      include: { userProfiles: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      return apiError("Position not found", 404);
    }

    if (existing.userProfiles.length > 0) {
      return apiError("Cannot delete: position has assigned users", 400);
    }

    await prisma.position.delete({ where: { id } });

    await createAuditLog(
      Number(session.user.id),
      "DELETE",
      "POSITION",
      id
    );

    return apiResponse({ message: "Position deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
