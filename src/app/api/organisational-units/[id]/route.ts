import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updateOrgUnitSchema } from "@/lib/validations/organisational-unit";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const unit = await prisma.organisationalUnit.findUnique({
      where: { id: Number(id) },
      include: { superior: true, children: true },
    });

    if (!unit) {
      return apiError("Organisational unit not found", 404);
    }

    return apiResponse(unit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const data = await parseBody(request, updateOrgUnitSchema);

    const existing = await prisma.organisationalUnit.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return apiError("Organisational unit not found", 404);
    }

    const unit = await prisma.organisationalUnit.update({
      where: { id: Number(id) },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.superiorId !== undefined && { superiorId: data.superiorId }),
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "UPDATE",
      "ORGANISATIONAL_UNIT",
      unit.id
    );

    return apiResponse(unit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;

    const existing = await prisma.organisationalUnit.findUnique({
      where: { id: Number(id) },
      include: { userProfiles: { select: { id: true }, take: 1 }, children: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      return apiError("Organisational unit not found", 404);
    }

    if (existing.userProfiles.length > 0) {
      return apiError("Cannot delete: organisational unit has assigned users", 400);
    }

    if (existing.children.length > 0) {
      return apiError("Cannot delete: organisational unit has child units", 400);
    }

    await prisma.organisationalUnit.delete({
      where: { id: Number(id) },
    });

    await createAuditLog(
      Number(session.user.id),
      "DELETE",
      "ORGANISATIONAL_UNIT",
      id
    );

    return apiResponse({ message: "Organisational unit deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
