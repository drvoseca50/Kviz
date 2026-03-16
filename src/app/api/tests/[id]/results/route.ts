import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireAuth,
  handleApiError,
} from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tests/[id]/results
 * Returns the user's test result with scored answers and competence breakdown.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const testId = Number(id);
    const userId = Number(session.user.id);

    const result = await prisma.testResult.findFirst({
      where: { testId, userProfileId: userId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                questionType: true,
                possibleAnswers: true,
                correctAnswers: true,
                imagePath: true,
                competenceId: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return apiError("No result found for this test", 404);
    }

    // Get competence names for breakdown
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { type: true, name: true },
    });

    const hseRatings = await prisma.hseRequirementRating.findMany({
      where: { testId, userProfileId: userId },
      include: { competence: { select: { id: true, name: true, passingIndicator: true } } },
    });

    const techRatings = await prisma.requirementRating.findMany({
      where: { testId, userProfileId: userId },
    });

    return apiResponse({
      testName: test?.name,
      testType: test?.type,
      result: {
        id: result.id,
        passed: result.passed,
        percentage: result.percentage,
        dateTime: result.dateTime,
        remainingTime: result.remainingTime,
        stopped: result.stopped,
      },
      answers: result.answers.map((a) => ({
        questionId: a.questionId,
        userAnswer: a.answer,
        correct: a.correct,
        question: a.question,
      })),
      competenceBreakdown: hseRatings.map((r) => ({
        competenceId: r.competenceId,
        competenceName: r.competence.name,
        passingIndicator: r.competence.passingIndicator,
        score: r.score,
        passed: r.fulfill,
      })),
      techRatings: techRatings.map((r) => ({
        rating: r.rating,
        passed: r.fulfill,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
