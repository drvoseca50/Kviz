import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireAuth,
  handleApiError,
} from "@/lib/api-utils";
import { scoreTest } from "@/lib/scoring";
import { generateRetakeTest } from "@/lib/test-generation";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const submitTestSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number().int(),
      answer: z.unknown(),
    })
  ),
  remainingTime: z.number().int().min(0).nullable().optional(),
  stopped: z.boolean().optional(),
});

/**
 * POST /api/tests/[id]/submit
 * Submit test answers, score, persist results, handle retake/lockout logic.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const testId = Number(id);
    const userId = Number(session.user.id);

    const body = await request.json();
    const data = submitTestSchema.parse(body);

    // Verify user is assigned
    const assignment = await prisma.testUserProfile.findUnique({
      where: {
        testId_userProfileId: { testId, userProfileId: userId },
      },
    });

    if (!assignment) {
      return apiError("You are not assigned to this test", 403);
    }

    // Check if already submitted
    const existingResult = await prisma.testResult.findFirst({
      where: { testId, userProfileId: userId },
    });

    if (existingResult) {
      return apiError("You have already submitted this test", 400);
    }

    // Load test questions with correct answers
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                questionType: true,
                correctAnswers: true,
                competenceId: true,
              },
            },
          },
        },
      },
    });

    if (!test) {
      return apiError("Test not found", 404);
    }

    const questions = test.questions.map((tq) => tq.question);

    // Load passing indicators for each competence
    const competenceIds = [...new Set(questions.map((q) => q.competenceId))];
    const competences = await prisma.competence.findMany({
      where: { id: { in: competenceIds } },
      select: { id: true, passingIndicator: true },
    });

    const passingIndicators = new Map<string, number>();
    for (const c of competences) {
      passingIndicators.set(c.id, c.passingIndicator ?? 100);
    }

    // Score the test
    const scoringResult = scoreTest(questions, data.answers, passingIndicators);

    // Persist results in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create test result
      const testResult = await tx.testResult.create({
        data: {
          testId,
          userProfileId: userId,
          passed: scoringResult.overallPassed,
          percentage: scoringResult.overallPercentage,
          remainingTime: data.remainingTime ?? null,
          stopped: data.stopped ?? false,
        },
      });

      // Create test answers
      await tx.testAnswer.createMany({
        data: scoringResult.answers.map((a) => ({
          questionId: a.questionId,
          answer: a.answer,
          correct: a.correct,
          testResultId: testResult.id,
        })),
      });

      // Create per-competence ratings
      if (test.type === "HSE") {
        await tx.hseRequirementRating.createMany({
          data: scoringResult.competenceScores.map((cs) => ({
            competenceId: cs.competenceId,
            testId,
            userProfileId: userId,
            fulfill: cs.passed,
            score: cs.percentage,
          })),
        });
      } else {
        await tx.requirementRating.createMany({
          data: scoringResult.competenceScores.map((cs) => ({
            testId,
            userProfileId: userId,
            fulfill: cs.passed,
            rating: cs.percentage,
          })),
        });
      }

      return testResult;
    });

    // Handle retake/lockout logic after transaction
    let retakeTestId: number | null = null;

    if (!scoringResult.overallPassed) {
      // Check iteration: if > 2 (3rd failure), lock the user
      if (test.iteration >= 2) {
        await prisma.userProfile.update({
          where: { id: userId },
          data: { hseBlocked: true },
        });

        // Notify HSE manager
        const user = await prisma.userProfile.findUnique({
          where: { id: userId },
          select: { hseManagerId: true, lastNameFirstName: true },
        });

        if (user?.hseManagerId) {
          await prisma.notification.create({
            data: {
              message: `User ${user.lastNameFirstName ?? "Unknown"} has been locked after failing test "${test.name}" 3 times.`,
              userProfileId: user.hseManagerId,
              url: `/manager/lockout-management`,
            },
          });
        }
      } else {
        // Generate retake test with new questions for failed competences
        try {
          const retakeTest = await generateRetakeTest({
            parentTestId: testId,
            failedCompetenceIds: scoringResult.failedCompetenceIds,
            createdById: test.createdById ?? userId,
          });

          retakeTestId = retakeTest.id;

          // Auto-assign to the same user
          await prisma.testUserProfile.create({
            data: { testId: retakeTest.id, userProfileId: userId },
          });

          // Notify user about retake
          await prisma.notification.create({
            data: {
              message: `A retake test "${retakeTest.name}" has been generated for you.`,
              userProfileId: userId,
              url: `/user/tests`,
            },
          });
        } catch {
          // If retake generation fails (e.g., insufficient questions), continue
          // The test result is already saved
        }
      }
    }

    return apiResponse({
      resultId: result.id,
      passed: scoringResult.overallPassed,
      percentage: scoringResult.overallPercentage,
      competenceScores: scoringResult.competenceScores,
      retakeTestId,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
