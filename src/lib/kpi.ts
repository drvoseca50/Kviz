import { prisma } from "@/lib/prisma";

interface KpiFilters {
  userId?: number;
  managerId?: number;
  departmentId?: number;
  testId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

function buildResultWhere(filters: KpiFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters.userId) {
    where.userProfileId = filters.userId;
  }

  if (filters.managerId) {
    where.userProfile = { managerId: filters.managerId };
  }

  if (filters.testId) {
    where.testId = filters.testId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.dateTime = {};
    if (filters.dateFrom) where.dateTime.gte = filters.dateFrom;
    if (filters.dateTo) where.dateTime.lte = filters.dateTo;
  }

  return where;
}

export async function getKpis(filters: KpiFilters) {
  const resultWhere = buildResultWhere(filters);

  // 1. Total tests assigned
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignWhere: any = {};
  if (filters.userId) assignWhere.userProfileId = filters.userId;
  if (filters.managerId) assignWhere.userProfile = { managerId: filters.managerId };

  const totalTestsAssigned = await prisma.testUserProfile.count({ where: assignWhere });

  // 2. Overall pass rate
  const allResults = await prisma.testResult.findMany({
    where: resultWhere,
    select: { passed: true },
  });
  const completedCount = allResults.length;
  const passedCount = allResults.filter((r) => r.passed === true).length;
  const overallPassRate = completedCount > 0
    ? Math.round((passedCount / completedCount) * 100)
    : 0;

  // 3 & 4. Best/worst competency by avg score
  const hseRatings = await prisma.hseRequirementRating.findMany({
    where: {
      ...(filters.userId && { userProfileId: filters.userId }),
      ...(filters.managerId && { userProfile: { managerId: filters.managerId } }),
    },
    select: { competenceId: true, score: true, competence: { select: { name: true } } },
  });

  const compScores = new Map<string, { name: string; total: number; count: number }>();
  for (const r of hseRatings) {
    if (r.score == null) continue;
    const entry = compScores.get(r.competenceId) ?? { name: r.competence.name, total: 0, count: 0 };
    entry.total += r.score;
    entry.count++;
    compScores.set(r.competenceId, entry);
  }

  let bestCompetency = { name: "N/A", avgScore: 0 };
  let worstCompetency = { name: "N/A", avgScore: 0 };

  if (compScores.size > 0) {
    let bestAvg = -1;
    let worstAvg = 101;
    for (const [, entry] of compScores) {
      const avg = Math.round(entry.total / entry.count);
      if (avg > bestAvg) { bestAvg = avg; bestCompetency = { name: entry.name, avgScore: avg }; }
      if (avg < worstAvg) { worstAvg = avg; worstCompetency = { name: entry.name, avgScore: avg }; }
    }
  }

  // 5. Number of locked users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lockedWhere: any = { hseBlocked: true };
  if (filters.managerId) lockedWhere.managerId = filters.managerId;
  const lockedUsersCount = await prisma.userProfile.count({ where: lockedWhere });

  // 6. Average score by position
  const positionResults = await prisma.testResult.findMany({
    where: resultWhere,
    select: {
      percentage: true,
      userProfile: {
        select: { position: { select: { id: true, name: true } } },
      },
    },
  });

  const posScores = new Map<string, { name: string; total: number; count: number }>();
  for (const r of positionResults) {
    if (r.percentage == null || !r.userProfile.position) continue;
    const posId = r.userProfile.position.id;
    const entry = posScores.get(posId) ?? { name: r.userProfile.position.name, total: 0, count: 0 };
    entry.total += r.percentage;
    entry.count++;
    posScores.set(posId, entry);
  }

  const avgScoreByPosition = [...posScores.entries()].map(([id, e]) => ({
    positionId: id,
    positionName: e.name,
    avgScore: Math.round(e.total / e.count),
  }));

  return {
    totalTestsAssigned,
    overallPassRate,
    completedCount,
    passedCount,
    bestCompetency,
    worstCompetency,
    lockedUsersCount,
    avgScoreByPosition,
  };
}

export async function getTestResultsOverTime(filters: KpiFilters) {
  const resultWhere = buildResultWhere(filters);

  const results = await prisma.testResult.findMany({
    where: resultWhere,
    select: { dateTime: true, passed: true, percentage: true },
    orderBy: { dateTime: "asc" },
  });

  // Group by month
  const monthly = new Map<string, { passed: number; failed: number; total: number; avgScore: number; scoreSum: number }>();

  for (const r of results) {
    const key = `${r.dateTime.getFullYear()}-${String(r.dateTime.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthly.get(key) ?? { passed: 0, failed: 0, total: 0, avgScore: 0, scoreSum: 0 };
    entry.total++;
    if (r.passed) entry.passed++;
    else entry.failed++;
    entry.scoreSum += r.percentage ?? 0;
    monthly.set(key, entry);
  }

  return [...monthly.entries()].map(([month, data]) => ({
    month,
    passed: data.passed,
    failed: data.failed,
    total: data.total,
    avgScore: Math.round(data.scoreSum / data.total),
  }));
}

export async function getPassFailDistribution(filters: KpiFilters) {
  const resultWhere = buildResultWhere(filters);

  const results = await prisma.testResult.findMany({
    where: resultWhere,
    select: { passed: true },
  });

  const passed = results.filter((r) => r.passed === true).length;
  const failed = results.filter((r) => r.passed === false).length;

  return { passed, failed };
}

export async function getCompetencyScores(filters: KpiFilters) {
  const ratings = await prisma.hseRequirementRating.findMany({
    where: {
      ...(filters.userId && { userProfileId: filters.userId }),
      ...(filters.managerId && { userProfile: { managerId: filters.managerId } }),
    },
    select: {
      competenceId: true,
      score: true,
      fulfill: true,
      competence: { select: { name: true } },
    },
  });

  const compMap = new Map<string, { name: string; scores: number[] }>();
  for (const r of ratings) {
    if (r.score == null) continue;
    const entry = compMap.get(r.competenceId) ?? { name: r.competence.name, scores: [] };
    entry.scores.push(r.score);
    compMap.set(r.competenceId, entry);
  }

  return [...compMap.entries()].map(([id, data]) => ({
    competenceId: id,
    competenceName: data.name,
    avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    count: data.scores.length,
  }));
}
