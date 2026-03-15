import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createQuestionSchema } from "@/lib/validations/question";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN", "MANAGER");

    const { searchParams } = new URL(request.url);
    const competenceId = searchParams.get("competenceId");
    const level = searchParams.get("level");
    const questionType = searchParams.get("questionType");

    const questions = await prisma.question.findMany({
      where: {
        ...(competenceId && { competenceId }),
        ...(level && { level: Number(level) }),
        ...(questionType && { questionType: questionType as "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "ORDERING" | "IMAGE_PLACEMENT" }),
      },
      include: {
        competence: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: [{ competenceId: "asc" }, { level: "asc" }],
    });

    return apiResponse(questions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const data = await parseBody(request, createQuestionSchema);

    const competence = await prisma.competence.findUnique({
      where: { id: data.competenceId },
    });

    if (!competence) {
      return apiResponse({ error: "Competence not found" }, 400);
    }

    const question = await prisma.question.create({
      data: {
        text: data.text,
        level: data.level,
        questionType: data.questionType,
        imagePath: data.imagePath ?? null,
        possibleAnswers: data.possibleAnswers,
        correctAnswers: data.correctAnswers,
        answerTime: data.answerTime ?? null,
        competenceId: data.competenceId,
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "CREATE",
      "QUESTION",
      question.id
    );

    return apiResponse(question, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
