import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updatePositionCompetencesSchema } from "@/lib/validations/position";
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
        competences: {
          include: { competence: true },
        },
      },
    });

    if (!position) {
      return apiError("Position not found", 404);
    }

    return apiResponse(position.competences.map((pc) => pc.competence));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, updatePositionCompetencesSchema);

    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Position not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.positionCompetence.deleteMany({ where: { positionId: id } });
      if (data.competenceIds.length > 0) {
        await tx.positionCompetence.createMany({
          data: data.competenceIds.map((competenceId) => ({
            positionId: id,
            competenceId,
          })),
        });
      }
    });

    await createAuditLog(
      Number(session.user.id),
      "UPDATE",
      "POSITION_COMPETENCES",
      id
    );

    return apiResponse({ message: "Position competences updated" });
  } catch (error) {
    return handleApiError(error);
  }
}
