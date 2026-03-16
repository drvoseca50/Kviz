"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Lock,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface Kpis {
  totalTestsAssigned: number;
  overallPassRate: number;
  completedCount: number;
  passedCount: number;
  bestCompetency: { name: string; avgScore: number };
  worstCompetency: { name: string; avgScore: number };
  lockedUsersCount: number;
  avgScoreByPosition: { positionId: string; positionName: string; avgScore: number }[];
}

interface Charts {
  resultsOverTime: { month: string; passed: number; failed: number; total: number; avgScore: number }[];
  passFailDistribution: { passed: number; failed: number };
  competencyScores: { competenceId: string; competenceName: string; avgScore: number; count: number }[];
}

const PIE_COLORS = ["#10B981", "#EF4444"];

interface DashboardViewProps {
  showLockedUsers?: boolean;
  showPositionScores?: boolean;
}

export function DashboardView({ showLockedUsers = true, showPositionScores = true }: DashboardViewProps) {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/kpis").then((r) => r.json()),
      fetch("/api/dashboard/charts").then((r) => r.json()),
    ])
      .then(([k, c]) => {
        setKpis(k);
        setCharts(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  if (!kpis || !charts) {
    return <p className="text-muted-foreground">Failed to load dashboard data.</p>;
  }

  const pieData = [
    { name: "Passed", value: charts.passFailDistribution.passed },
    { name: "Failed", value: charts.passFailDistribution.failed },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Tests Assigned"
          value={kpis.totalTestsAssigned}
          icon={<FileText className="h-5 w-5 text-blue-500" />}
        />
        <KpiCard
          title="Pass Rate"
          value={`${kpis.overallPassRate}%`}
          subtitle={`${kpis.passedCount} of ${kpis.completedCount} completed`}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        />
        <KpiCard
          title="Best Competency"
          value={kpis.bestCompetency.name}
          subtitle={kpis.bestCompetency.avgScore > 0 ? `Avg: ${kpis.bestCompetency.avgScore}%` : undefined}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
        />
        <KpiCard
          title="Worst Competency"
          value={kpis.worstCompetency.name}
          subtitle={kpis.worstCompetency.avgScore > 0 ? `Avg: ${kpis.worstCompetency.avgScore}%` : undefined}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
        />
        {showLockedUsers && (
          <KpiCard
            title="Locked Users"
            value={kpis.lockedUsersCount}
            icon={<Lock className="h-5 w-5 text-red-500" />}
          />
        )}
        {showPositionScores && kpis.avgScoreByPosition.length > 0 && (
          <KpiCard
            title="Avg Score (Top Position)"
            value={`${kpis.avgScoreByPosition[0].avgScore}%`}
            subtitle={kpis.avgScoreByPosition[0].positionName}
            icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Test Results Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Results Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {charts.resultsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.resultsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="passed" stroke="#10B981" name="Passed" strokeWidth={2} />
                  <Line type="monotone" dataKey="failed" stroke="#EF4444" name="Failed" strokeWidth={2} />
                  <Line type="monotone" dataKey="avgScore" stroke="#3B82F6" name="Avg Score %" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Pass/Fail Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pass/Fail Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Competency Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Competency Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {charts.competencyScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.competencyScores} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="competenceName"
                    width={150}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#3B82F6" name="Avg Score %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Score by Position */}
        {showPositionScores && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average Score by Position</CardTitle>
            </CardHeader>
            <CardContent>
              {kpis.avgScoreByPosition.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kpis.avgScoreByPosition}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="positionName" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="#8B5CF6" name="Avg Score %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-12">No data yet</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xl font-bold text-foreground truncate">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
