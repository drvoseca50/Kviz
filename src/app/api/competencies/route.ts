import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createCompetenceSchema } from "@/lib/validations/competence";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN", "MANAGER");

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const type = searchParams.get("type");

    const competencies = await prisma.competence.findMany({
      where: {
        ...(groupId && { competenceGroupId: groupId }),
        ...(type && { type: type as "PROFESSIONAL" | "HSE" }),
      },
      include: {
        competenceGroup: {
          include: {
            family: {
              include: { cluster: true },
            },
          },
        },
        responsibleManager: {
          select: { id: true, username: true, lastNameFirstName: true },
        },
        _count: { select: { questions: true } },
      },
      orderBy: { name: "asc" },
    });

    return apiResponse(competencies);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const data = await parseBody(request, createCompetenceSchema);

    const competence = await prisma.competence.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        type: data.type,
        indicatorLevel: data.indicatorLevel ?? null,
        indicatorName: data.indicatorName ?? null,
        passingIndicator: data.passingIndicator ?? null,
        competenceGroupId: data.competenceGroupId,
        responsibleManagerId: data.responsibleManagerId ?? null,
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "CREATE",
      "COMPETENCE",
      competence.id
    );

    return apiResponse(competence, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
