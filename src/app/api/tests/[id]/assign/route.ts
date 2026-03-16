import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { assignTestSchema } from "@/lib/validations/test-template";
import { createAuditLog } from "@/lib/audit-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireRole("ADMIN", "MANAGER");
    const { id } = await params;

    const assignments = await prisma.testUserProfile.findMany({
      where: { testId: Number(id) },
      include: {
        userProfile: {
          select: { id: true, username: true, lastNameFirstName: true },
        },
      },
    });

    return apiResponse(assignments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const { id } = await params;
    const data = await parseBody(request, assignTestSchema);

    const testId = Number(id);
    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) {
      return apiError("Test not found", 404);
    }

    // Filter out already-assigned users
    const existing = await prisma.testUserProfile.findMany({
      where: { testId },
      select: { userProfileId: true },
    });
    const existingSet = new Set(existing.map((e) => e.userProfileId));
    const newUserIds = data.userIds.filter((uid) => !existingSet.has(uid));

    if (newUserIds.length === 0) {
      return apiError("All users are already assigned to this test", 400);
    }

    await prisma.testUserProfile.createMany({
      data: newUserIds.map((userProfileId) => ({
        testId,
        userProfileId,
      })),
    });

    // Create in-app notifications for assigned users
    await prisma.notification.createMany({
      data: newUserIds.map((userProfileId) => ({
        message: `You have been assigned a new test: ${test.name}`,
        userProfileId,
        url: `/user/tests`,
      })),
    });

    await createAuditLog(
      Number(session.user.id),
      "ASSIGN",
      "TEST",
      testId.toString()
    );

    return apiResponse({
      message: `Test assigned to ${newUserIds.length} user(s)`,
      assignedCount: newUserIds.length,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
