import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createGroupSchema } from "@/lib/validations/competence";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN", "MANAGER");

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");

    const groups = await prisma.competenceGroup.findMany({
      where: familyId ? { familyId: Number(familyId) } : undefined,
      include: {
        family: { include: { cluster: true } },
      },
      orderBy: { name: "asc" },
    });

    return apiResponse(groups);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const data = await parseBody(request, createGroupSchema);

    const group = await prisma.competenceGroup.create({
      data: {
        name: data.name,
        type: data.type ?? null,
        familyId: data.familyId,
      },
    });

    await createAuditLog(Number(session.user.id), "CREATE", "COMPETENCE_GROUP", group.id);

    return apiResponse(group, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
