"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LockOpen } from "lucide-react";

interface LockedUser {
  id: number;
  username: string;
  lastNameFirstName: string | null;
  sapId: number;
  email: string | null;
  hseBlocked: boolean;
  position: { name: string } | null;
  organisationalUnit: { name: string } | null;
}

const columns: Column<LockedUser>[] = [
  { key: "username", label: "Username", sortable: true },
  { key: "lastNameFirstName", label: "Name", sortable: true },
  { key: "sapId", label: "SAP ID", sortable: true },
  {
    key: "position",
    label: "Position",
    render: (u) => u.position?.name ?? "—",
  },
  {
    key: "organisationalUnit",
    label: "Department",
    render: (u) => u.organisationalUnit?.name ?? "—",
  },
  {
    key: "hseBlocked",
    label: "Status",
    render: () => <Badge variant="destructive">HSE Blocked</Badge>,
  },
];

export default function ManagerLockoutPage() {
  const [users, setUsers] = useState<LockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  function loadData() {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data: LockedUser[]) => {
        setUsers(data.filter((u: LockedUser) => u.hseBlocked));
        setLoading(false);
      });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  async function handleUnlock(userId: number) {
    if (!confirm("Are you sure you want to unlock this employee?")) return;
    const res = await fetch(`/api/users/${userId}/lockout`, { method: "PUT" });
    if (res.ok) {
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to unlock user");
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">HSE Lockout Management</h1>
        <p className="text-sm text-muted-foreground">
          Employees blocked due to failed HSE tests — {users.length} blocked
        </p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-sm">
          <p className="text-muted-foreground">No blocked employees</p>
        </div>
      ) : (
        <DataTable
          data={users as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchKey="username"
          searchPlaceholder="Search by username..."
          actions={(user) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUnlock((user as unknown as LockedUser).id)}
              title="Unlock employee"
            >
              <LockOpen className="h-4 w-4" />
            </Button>
          )}
        />
      )}
    </div>
  );
}
