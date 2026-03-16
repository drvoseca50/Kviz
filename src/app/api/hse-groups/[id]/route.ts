import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updateHseGroupSchema } from "@/lib/validations/hse-group";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const group = await prisma.hseGroup.findUnique({
      where: { id },
      include: { positions: true, competences: { include: { competence: true } } },
    });

    if (!group) {
      return apiError("HSE group not found", 404);
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
    const data = await parseBody(request, updateHseGroupSchema);

    const existing = await prisma.hseGroup.findUnique({ where: { id } });
    if (!existing) {
      return apiError("HSE group not found", 404);
    }

    const { competenceIds, ...fields } = data;

    const group = await prisma.$transaction(async (tx) => {
      const updated = await tx.hseGroup.update({
        where: { id },
        data: {
          ...(fields.name !== undefined && { name: fields.name }),
          ...(fields.program !== undefined && { program: fields.program }),
          ...(fields.riskPriority !== undefined && { riskPriority: fields.riskPriority }),
          ...(fields.minQuestionCountHse !== undefined && { minQuestionCountHse: fields.minQuestionCountHse }),
          ...(fields.totalQuestionCountHse !== undefined && { totalQuestionCountHse: fields.totalQuestionCountHse }),
        },
      });

      if (competenceIds !== undefined) {
        await tx.hseGroupCompetence.deleteMany({ where: { hseGroupId: id } });
        if (competenceIds.length > 0) {
          await tx.hseGroupCompetence.createMany({
            data: competenceIds.map((competenceId) => ({
              hseGroupId: id,
              competenceId,
            })),
          });
        }
      }

      return updated;
    });

    await createAuditLog(
      Number(session.user.id),
      "UPDATE",
      "HSE_GROUP",
      group.id
    );

    return apiResponse(group);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;

    const existing = await prisma.hseGroup.findUnique({
      where: { id },
      include: { positions: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      return apiError("HSE group not found", 404);
    }

    if (existing.positions.length > 0) {
      return apiError("Cannot delete: HSE group has assigned positions", 400);
    }

    await prisma.hseGroup.delete({ where: { id } });

    await createAuditLog(
      Number(session.user.id),
      "DELETE",
      "HSE_GROUP",
      id
    );

    return apiResponse({ message: "HSE group deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
