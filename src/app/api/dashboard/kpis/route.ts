import { apiResponse, requireAuth, handleApiError } from "@/lib/api-utils";
import { getKpis } from "@/lib/kpi";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const roles = session.user.roles ?? [];
    const userId = Number(session.user.id);

    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Scope by role
    const filters: Parameters<typeof getKpis>[0] = {};

    if (roles.includes("ADMIN")) {
      // Admin can filter by anything
      if (managerId) filters.managerId = Number(managerId);
    } else if (roles.includes("MANAGER")) {
      // Manager sees only their employees
      filters.managerId = userId;
    } else {
      // User sees only their own
      filters.userId = userId;
    }

    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    const kpis = await getKpis(filters);
    return apiResponse(kpis);
  } catch (error) {
    return handleApiError(error);
  }
}
