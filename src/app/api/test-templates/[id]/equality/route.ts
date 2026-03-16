import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { setCompetenceEqualitySchema } from "@/lib/validations/test-template";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const templateId = Number(id);
    const existing = await prisma.testTemplate.findUnique({ where: { id: templateId } });
    if (!existing) {
      return apiError("Test template not found", 404);
    }

    const equalities = await prisma.competenceEquality.findMany({
      where: { testTemplateId: templateId },
      include: { competence: { select: { id: true, name: true } } },
    });

    return apiResponse(equalities);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, setCompetenceEqualitySchema);

    const templateId = Number(id);
    const existing = await prisma.testTemplate.findUnique({ where: { id: templateId } });
    if (!existing) {
      return apiError("Test template not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.competenceEquality.deleteMany({ where: { testTemplateId: templateId } });
      if (data.equalities.length > 0) {
        await tx.competenceEquality.createMany({
          data: data.equalities.map((eq) => ({
            testTemplateId: templateId,
            competenceId: eq.competenceId,
            isNumOfQuestionPerLevelEqual: eq.isNumOfQuestionPerLevelEqual,
          })),
        });
      }
    });

    await createAuditLog(
      Number(session.user.id),
      "UPDATE",
      "COMPETENCE_EQUALITY",
      id
    );

    return apiResponse({ message: "Competence equality settings updated" });
  } catch (error) {
    return handleApiError(error);
  }
}
