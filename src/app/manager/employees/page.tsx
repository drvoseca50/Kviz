"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: number;
  username: string;
  email: string | null;
  lastNameFirstName: string | null;
  sapId: number;
  hseBlocked: boolean;
  endDate: string | null;
  position: { name: string } | null;
  organisationalUnit: { name: string } | null;
  roles: { role: { name: string } }[];
}

const columns: Column<Employee>[] = [
  { key: "username", label: "Username", sortable: true },
  { key: "lastNameFirstName", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "sapId", label: "SAP ID", sortable: true },
  {
    key: "position",
    label: "Position",
    render: (e) => e.position?.name ?? "—",
  },
  {
    key: "organisationalUnit",
    label: "Department",
    render: (e) => e.organisationalUnit?.name ?? "—",
  },
  {
    key: "status",
    label: "Status",
    render: (e) => {
      if (e.endDate) return <Badge variant="secondary">Inactive</Badge>;
      if (e.hseBlocked) return <Badge variant="destructive">Blocked</Badge>;
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    },
  },
];

export default function ManagerEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Employees</h1>
        <p className="text-sm text-muted-foreground">
          Employees under your management
        </p>
      </div>

      <DataTable
        data={employees as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="username"
        searchPlaceholder="Search by username..."
      />
    </div>
  );
}
