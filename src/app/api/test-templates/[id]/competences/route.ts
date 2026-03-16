import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { setTemplateCompetencesSchema } from "@/lib/validations/test-template";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const template = await prisma.testTemplate.findUnique({
      where: { id: Number(id) },
      include: {
        competences: {
          include: { competence: { select: { id: true, name: true, type: true } } },
        },
      },
    });

    if (!template) {
      return apiError("Test template not found", 404);
    }

    return apiResponse(template.competences);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, setTemplateCompetencesSchema);

    const templateId = Number(id);
    const existing = await prisma.testTemplate.findUnique({ where: { id: templateId } });
    if (!existing) {
      return apiError("Test template not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.testTemplateCompetence.deleteMany({ where: { testTemplateId: templateId } });
      if (data.competences.length > 0) {
        await tx.testTemplateCompetence.createMany({
          data: data.competences.map((c) => ({
            testTemplateId: templateId,
            competenceId: c.competenceId,
            numberOfQuestions: c.numberOfQuestions,
          })),
        });
      }
    });

    await createAuditLog(
      Number(session.user.id),
      "UPDATE",
      "TEST_TEMPLATE_COMPETENCES",
      id
    );

    return apiResponse({ message: "Template competences updated" });
  } catch (error) {
    return handleApiError(error);
  }
}
