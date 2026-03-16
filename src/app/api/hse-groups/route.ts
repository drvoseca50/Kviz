import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createHseGroupSchema } from "@/lib/validations/hse-group";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  try {
    await requireRole("ADMIN", "MANAGER");

    const groups = await prisma.hseGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { competences: true, positions: true } },
      },
    });

    return apiResponse(groups);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN");
    const data = await parseBody(request, createHseGroupSchema);

    const group = await prisma.hseGroup.create({ data });

    await createAuditLog(
      Number(session.user.id),
      "CREATE",
      "HSE_GROUP",
      group.id
    );

    return apiResponse(group, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
