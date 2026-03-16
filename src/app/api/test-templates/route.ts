import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createTestTemplateSchema } from "@/lib/validations/test-template";
import { createAuditLog } from "@/lib/audit-log";

export async function GET() {
  try {
    await requireRole("ADMIN", "MANAGER");

    const templates = await prisma.testTemplate.findMany({
      include: {
        competences: {
          include: { competence: { select: { id: true, name: true, type: true } } },
        },
        _count: { select: { tests: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(templates);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const data = await parseBody(request, createTestTemplateSchema);

    const template = await prisma.testTemplate.create({
      data: { name: data.name },
    });

    await createAuditLog(
      Number(session.user.id),
      "CREATE",
      "TEST_TEMPLATE",
      template.id.toString()
    );

    return apiResponse(template, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
