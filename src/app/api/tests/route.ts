import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  handleApiError,
} from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const userId = Number(session.user.id);
    const isAdmin = session.user.roles?.includes("ADMIN");

    const tests = await prisma.test.findMany({
      where: isAdmin ? {} : { createdById: userId },
      include: {
        testTemplate: {
          select: {
            id: true,
            name: true,
            competences: {
              select: { competence: { select: { id: true, name: true } } },
            },
          },
        },
        hseGroup: { select: { id: true, name: true } },
        _count: {
          select: {
            questions: true,
            assignedUsers: true,
            results: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(tests);
  } catch (error) {
    return handleApiError(error);
  }
}
