"use client";

import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Your test results and performance</p>
      </div>
      <DashboardView showLockedUsers={false} showPositionScores={false} />
    </div>
  );
}
