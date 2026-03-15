import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updateCompetenceSchema } from "@/lib/validations/competence";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const competence = await prisma.competence.findUnique({
      where: { id },
      include: {
        competenceGroup: {
          include: { family: { include: { cluster: true } } },
        },
        responsibleManager: {
          select: { id: true, username: true, lastNameFirstName: true },
        },
        questions: true,
      },
    });

    if (!competence) {
      return apiError("Competence not found", 404);
    }

    return apiResponse(competence);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, updateCompetenceSchema);

    const existing = await prisma.competence.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Competence not found", 404);
    }

    const competence = await prisma.competence.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.indicatorLevel !== undefined && { indicatorLevel: data.indicatorLevel }),
        ...(data.indicatorName !== undefined && { indicatorName: data.indicatorName }),
        ...(data.passingIndicator !== undefined && { passingIndicator: data.passingIndicator }),
        ...(data.competenceGroupId !== undefined && { competenceGroupId: data.competenceGroupId }),
        ...(data.responsibleManagerId !== undefined && { responsibleManagerId: data.responsibleManagerId }),
      },
    });

    await createAuditLog(Number(session.user.id), "UPDATE", "COMPETENCE", competence.id);

    return apiResponse(competence);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;

    const existing = await prisma.competence.findUnique({
      where: { id },
      include: { questions: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      return apiError("Competence not found", 404);
    }

    if (existing.questions.length > 0) {
      return apiError("Cannot delete: competence has questions. Delete them first.", 400);
    }

    await prisma.competence.delete({ where: { id } });
    await createAuditLog(Number(session.user.id), "DELETE", "COMPETENCE", id);

    return apiResponse({ message: "Competence deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
