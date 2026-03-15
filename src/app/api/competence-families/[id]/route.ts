import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updateFamilySchema } from "@/lib/validations/competence";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const family = await prisma.competenceFamily.findUnique({
      where: { id: Number(id) },
      include: { cluster: true, groups: true },
    });

    if (!family) {
      return apiError("Family not found", 404);
    }

    return apiResponse(family);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, updateFamilySchema);

    const existing = await prisma.competenceFamily.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return apiError("Family not found", 404);
    }

    const family = await prisma.competenceFamily.update({
      where: { id: Number(id) },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.clusterId !== undefined && { clusterId: data.clusterId }),
      },
    });

    await createAuditLog(Number(session.user.id), "UPDATE", "COMPETENCE_FAMILY", family.id);

    return apiResponse(family);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const numId = Number(id);

    const existing = await prisma.competenceFamily.findUnique({
      where: { id: numId },
      include: { groups: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      return apiError("Family not found", 404);
    }

    if (existing.groups.length > 0) {
      return apiError("Cannot delete: family has groups. Delete them first.", 400);
    }

    await prisma.competenceFamily.delete({ where: { id: numId } });
    await createAuditLog(Number(session.user.id), "DELETE", "COMPETENCE_FAMILY", numId);

    return apiResponse({ message: "Family deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
