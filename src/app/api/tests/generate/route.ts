import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { generateTestSchema } from "@/lib/validations/test-template";
import { generateTest } from "@/lib/test-generation";
import { createAuditLog } from "@/lib/audit-log";

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const data = await parseBody(request, generateTestSchema);

    const test = await generateTest({
      testTemplateId: data.testTemplateId,
      name: data.name,
      description: data.description,
      type: data.type,
      totalTime: data.totalTime,
      hseGroupId: data.hseGroupId,
      createdById: Number(session.user.id),
    });

    await createAuditLog(
      Number(session.user.id),
      "CREATE",
      "TEST",
      test.id.toString()
    );

    return apiResponse(test, 201);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Insufficient questions")) {
      const { apiError } = await import("@/lib/api-utils");
      return apiError(error.message, 400);
    }
    return handleApiError(error);
  }
}
