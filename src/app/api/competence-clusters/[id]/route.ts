import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updateClusterSchema } from "@/lib/validations/competence";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const cluster = await prisma.competenceCluster.findUnique({
      where: { id: Number(id) },
      include: {
        families: {
          include: { groups: true },
        },
      },
    });

    if (!cluster) {
      return apiError("Cluster not found", 404);
    }

    return apiResponse(cluster);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, updateClusterSchema);

    const existing = await prisma.competenceCluster.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return apiError("Cluster not found", 404);
    }

    const cluster = await prisma.competenceCluster.update({
      where: { id: Number(id) },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
      },
    });

    await createAuditLog(Number(session.user.id), "UPDATE", "COMPETENCE_CLUSTER", cluster.id);

    return apiResponse(cluster);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const numId = Number(id);

    const existing = await prisma.competenceCluster.findUnique({
      where: { id: numId },
      include: { families: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      return apiError("Cluster not found", 404);
    }

    if (existing.families.length > 0) {
      return apiError("Cannot delete: cluster has families. Delete them first.", 400);
    }

    await prisma.competenceCluster.delete({ where: { id: numId } });
    await createAuditLog(Number(session.user.id), "DELETE", "COMPETENCE_CLUSTER", numId);

    return apiResponse({ message: "Cluster deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
