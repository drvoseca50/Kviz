import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  handleApiError,
} from "@/lib/api-utils";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const test = await prisma.test.findUnique({
      where: { id: Number(id) },
      include: {
        testTemplate: { select: { id: true, name: true } },
        hseGroup: { select: { id: true, name: true } },
        questions: {
          include: {
            question: {
              select: { id: true, text: true, level: true, questionType: true, competenceId: true },
            },
          },
        },
        assignedUsers: {
          include: {
            userProfile: {
              select: { id: true, username: true, lastNameFirstName: true },
            },
          },
        },
        results: {
          include: {
            userProfile: {
              select: { id: true, username: true, lastNameFirstName: true },
            },
          },
        },
        parentTest: { select: { id: true, name: true } },
        retakes: { select: { id: true, name: true, iteration: true } },
      },
    });

    if (!test) {
      return apiError("Test not found", 404);
    }

    return apiResponse(test);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;

    const testId = Number(id);
    const existing = await prisma.test.findUnique({
      where: { id: testId },
      include: { results: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      return apiError("Test not found", 404);
    }

    if (existing.results.length > 0) {
      return apiError("Cannot delete: test has results", 400);
    }

    await prisma.test.delete({ where: { id: testId } });

    await createAuditLog(
      Number(session.user.id),
      "DELETE",
      "TEST",
      id
    );

    return apiResponse({ message: "Test deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
