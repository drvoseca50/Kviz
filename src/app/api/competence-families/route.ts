import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createFamilySchema } from "@/lib/validations/competence";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN", "MANAGER");

    const { searchParams } = new URL(request.url);
    const clusterId = searchParams.get("clusterId");

    const families = await prisma.competenceFamily.findMany({
      where: clusterId ? { clusterId: Number(clusterId) } : undefined,
      include: {
        cluster: true,
        groups: true,
      },
      orderBy: { name: "asc" },
    });

    return apiResponse(families);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const data = await parseBody(request, createFamilySchema);

    const family = await prisma.competenceFamily.create({
      data: {
        name: data.name,
        type: data.type ?? null,
        clusterId: data.clusterId,
      },
    });

    await createAuditLog(Number(session.user.id), "CREATE", "COMPETENCE_FAMILY", family.id);

    return apiResponse(family, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
