import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createOrgUnitSchema } from "@/lib/validations/organisational-unit";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  try {
    await requireRole("ADMIN", "MANAGER");

    const units = await prisma.organisationalUnit.findMany({
      include: { superior: true },
      orderBy: { name: "asc" },
    });

    return apiResponse(units);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN");
    const data = await parseBody(request, createOrgUnitSchema);

    const unit = await prisma.organisationalUnit.create({
      data: {
        name: data.name,
        superiorId: data.superiorId ?? null,
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "CREATE",
      "ORGANISATIONAL_UNIT",
      unit.id
    );

    return apiResponse(unit, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
