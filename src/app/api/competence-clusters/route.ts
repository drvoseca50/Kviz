import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createClusterSchema } from "@/lib/validations/competence";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  try {
    await requireRole("ADMIN", "MANAGER");

    const clusters = await prisma.competenceCluster.findMany({
      include: {
        families: {
          include: {
            groups: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return apiResponse(clusters);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const data = await parseBody(request, createClusterSchema);

    const cluster = await prisma.competenceCluster.create({
      data: {
        name: data.name,
        type: data.type ?? null,
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "CREATE",
      "COMPETENCE_CLUSTER",
      cluster.id
    );

    return apiResponse(cluster, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
