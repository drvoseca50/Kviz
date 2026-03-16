"use client";

import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of your employees&apos; test results</p>
      </div>
      <DashboardView showLockedUsers={true} showPositionScores={true} />
    </div>
  );
}
