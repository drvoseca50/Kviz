import { prisma } from "@/lib/prisma";
import { apiResponse, requireRole, handleApiError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const entityType = searchParams.get("entityType") || undefined;
    const action = searchParams.get("action") || undefined;

    const where = {
      ...(entityType ? { entityType } : {}),
      ...(action ? { action } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: { id: true, username: true, lastNameFirstName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return apiResponse({ logs, total, page, limit });
  } catch (error) {
    return handleApiError(error);
  }
}
