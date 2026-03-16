import { apiResponse, requireAuth, handleApiError } from "@/lib/api-utils";
import {
  getTestResultsOverTime,
  getPassFailDistribution,
  getCompetencyScores,
} from "@/lib/kpi";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const roles = session.user.roles ?? [];
    const userId = Number(session.user.id);

    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const filters: {
      userId?: number;
      managerId?: number;
      dateFrom?: Date;
      dateTo?: Date;
    } = {};

    if (roles.includes("ADMIN")) {
      if (managerId) filters.managerId = Number(managerId);
    } else if (roles.includes("MANAGER")) {
      filters.managerId = userId;
    } else {
      filters.userId = userId;
    }

    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    const [resultsOverTime, passFailDistribution, competencyScores] =
      await Promise.all([
        getTestResultsOverTime(filters),
        getPassFailDistribution(filters),
        getCompetencyScores(filters),
      ]);

    return apiResponse({
      resultsOverTime,
      passFailDistribution,
      competencyScores,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
