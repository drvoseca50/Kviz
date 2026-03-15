import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { resetPasswordSchema } from "@/lib/validations/user";
import { createAuditLog } from "@/lib/audit-log";
import { hashPassword } from "@/lib/auth-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const userId = Number(id);
    const data = await parseBody(request, resetPasswordSchema);

    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const hashedPassword = await hashPassword(data.password);

    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: null, // force change on next login
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "RESET_PASSWORD",
      "USER_PROFILE",
      userId
    );

    return apiResponse({ message: "Password reset successfully. User must change password on next login." });
  } catch (error) {
    return handleApiError(error);
  }
}
