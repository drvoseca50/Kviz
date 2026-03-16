"use client";

import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of all test results and KPIs</p>
      </div>
      <DashboardView showLockedUsers={true} showPositionScores={true} />
    </div>
  );
}
