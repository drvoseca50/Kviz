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
 * GET /api/tests/[id]/take
 * Returns the test questions for a user to take. Only accessible if the user
 * is assigned to this test and hasn't already completed it.
 * Questions are returned WITHOUT correct answers.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const testId = Number(id);
    const userId = Number(session.user.id);

    // Verify user is assigned
    const assignment = await prisma.testUserProfile.findUnique({
      where: {
        testId_userProfileId: { testId, userProfileId: userId },
      },
    });

    if (!assignment) {
      return apiError("You are not assigned to this test", 403);
    }

    // Check if already completed
    const existingResult = await prisma.testResult.findFirst({
      where: { testId, userProfileId: userId },
    });

    if (existingResult) {
      return apiError("You have already completed this test", 400);
    }

    // Check if user is HSE blocked
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { hseBlocked: true },
    });

    if (user?.hseBlocked) {
      return apiError("Your test access has been locked. Contact your HSE manager.", 403);
    }

    // Get test with questions (without correct answers)
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                level: true,
                questionType: true,
                imagePath: true,
                possibleAnswers: true,
                answerTime: true,
                competenceId: true,
                // NOT including correctAnswers
              },
            },
          },
        },
      },
    });

    if (!test) {
      return apiError("Test not found", 404);
    }

    return apiResponse({
      id: test.id,
      name: test.name,
      description: test.description,
      type: test.type,
      totalTime: test.totalTime,
      iteration: test.iteration,
      questions: test.questions.map((tq) => tq.question),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
