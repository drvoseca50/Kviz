import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updateGroupSchema } from "@/lib/validations/competence";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const group = await prisma.competenceGroup.findUnique({
      where: { id },
      include: { family: { include: { cluster: true } } },
    });

    if (!group) {
      return apiError("Group not found", 404);
    }

    return apiResponse(group);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, updateGroupSchema);

    const existing = await prisma.competenceGroup.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Group not found", 404);
    }

    const group = await prisma.competenceGroup.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.familyId !== undefined && { familyId: data.familyId }),
      },
    });

    await createAuditLog(Number(session.user.id), "UPDATE", "COMPETENCE_GROUP", group.id);

    return apiResponse(group);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;

    const existing = await prisma.competenceGroup.findUnique({
      where: { id },
      include: { competences: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      return apiError("Group not found", 404);
    }

    if (existing.competences.length > 0) {
      return apiError("Cannot delete: group has competencies. Delete them first.", 400);
    }

    await prisma.competenceGroup.delete({ where: { id } });
    await createAuditLog(Number(session.user.id), "DELETE", "COMPETENCE_GROUP", id);

    return apiResponse({ message: "Group deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
