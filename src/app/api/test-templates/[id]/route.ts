import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updateTestTemplateSchema } from "@/lib/validations/test-template";
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
        competenceEqualities: {
          include: { competence: { select: { id: true, name: true } } },
        },
        _count: { select: { tests: true } },
      },
    });

    if (!template) {
      return apiError("Test template not found", 404);
    }

    return apiResponse(template);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, updateTestTemplateSchema);

    const existing = await prisma.testTemplate.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return apiError("Test template not found", 404);
    }

    const template = await prisma.testTemplate.update({
      where: { id: Number(id) },
      data: {
        ...(data.name !== undefined && { name: data.name }),
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "UPDATE",
      "TEST_TEMPLATE",
      template.id.toString()
    );

    return apiResponse(template);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;

    const existing = await prisma.testTemplate.findUnique({
      where: { id: Number(id) },
      include: { tests: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      return apiError("Test template not found", 404);
    }

    if (existing.tests.length > 0) {
      return apiError("Cannot delete: template has generated tests", 400);
    }

    await prisma.testTemplate.delete({ where: { id: Number(id) } });

    await createAuditLog(
      Number(session.user.id),
      "DELETE",
      "TEST_TEMPLATE",
      id
    );

    return apiResponse({ message: "Test template deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
