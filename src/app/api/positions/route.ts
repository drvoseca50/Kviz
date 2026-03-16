import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createPositionSchema } from "@/lib/validations/position";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  try {
    await requireRole("ADMIN", "MANAGER");

    const positions = await prisma.position.findMany({
      include: {
        hseGroup: true,
        _count: { select: { competences: true } },
      },
      orderBy: { name: "asc" },
    });

    return apiResponse(positions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const data = await parseBody(request, createPositionSchema);

    const position = await prisma.position.create({
      data: {
        name: data.name,
        hseGroupId: data.hseGroupId ?? null,
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "CREATE",
      "POSITION",
      position.id
    );

    return apiResponse(position, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
