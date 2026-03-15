import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { updateQuestionSchema } from "@/lib/validations/question";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: {
        competence: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    if (!question) {
      return apiError("Question not found", 404);
    }

    return apiResponse(question);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, updateQuestionSchema);

    const existing = await prisma.question.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return apiError("Question not found", 404);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (data.text !== undefined) updateData.text = data.text;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.questionType !== undefined) updateData.questionType = data.questionType;
    if (data.imagePath !== undefined) updateData.imagePath = data.imagePath;
    if (data.possibleAnswers !== undefined) updateData.possibleAnswers = data.possibleAnswers;
    if (data.correctAnswers !== undefined) updateData.correctAnswers = data.correctAnswers;
    if (data.answerTime !== undefined) updateData.answerTime = data.answerTime;
    if (data.competenceId !== undefined) updateData.competenceId = data.competenceId;

    const question = await prisma.question.update({
      where: { id: Number(id) },
      data: updateData,
    });

    await createAuditLog(Number(session.user.id), "UPDATE", "QUESTION", question.id);

    return apiResponse(question);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const numId = Number(id);

    const existing = await prisma.question.findUnique({ where: { id: numId } });
    if (!existing) {
      return apiError("Question not found", 404);
    }

    await prisma.question.delete({ where: { id: numId } });
    await createAuditLog(Number(session.user.id), "DELETE", "QUESTION", numId);

    return apiResponse({ message: "Question deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
