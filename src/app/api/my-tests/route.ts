import { prisma } from "@/lib/prisma";
import { apiResponse, requireAuth, handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = Number(session.user.id);

    const assignments = await prisma.testUserProfile.findMany({
      where: { userProfileId: userId },
      include: {
        test: {
          include: {
            testTemplate: { select: { name: true } },
            _count: { select: { questions: true } },
            results: {
              where: { userProfileId: userId },
              orderBy: { dateTime: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { test: { createdAt: "desc" } },
    });

    const tests = assignments.map((a) => {
      const result = a.test.results[0] ?? null;
      let status: "PENDING" | "COMPLETED" | "PASSED" | "FAILED" = "PENDING";
      if (result) {
        status = result.passed ? "PASSED" : "FAILED";
      }

      return {
        testId: a.test.id,
        name: a.test.name,
        description: a.test.description,
        type: a.test.type,
        totalTime: a.test.totalTime,
        questionCount: a.test._count.questions,
        templateName: a.test.testTemplate?.name ?? null,
        createdAt: a.test.createdAt,
        iteration: a.test.iteration,
        status,
        result: result
          ? {
              id: result.id,
              passed: result.passed,
              percentage: result.percentage,
              dateTime: result.dateTime,
            }
          : null,
      };
    });

    return apiResponse(tests);
  } catch (error) {
    return handleApiError(error);
  }
}
