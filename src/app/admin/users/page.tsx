"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";

interface User {
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

const columns: Column<User>[] = [
  { key: "username", label: "Username", sortable: true },
  { key: "lastNameFirstName", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
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
    key: "roles",
    label: "Roles",
    render: (u) => (
      <div className="flex gap-1">
        {u.roles.map((r) => (
          <Badge key={r.role.name} variant="secondary" className="text-xs">
            {r.role.name}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (u) => {
      if (u.endDate) return <Badge variant="secondary">Inactive</Badge>;
      if (u.hseBlocked) return <Badge variant="destructive">Blocked</Badge>;
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    },
  },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage employee accounts</p>
        </div>
        <Button onClick={() => router.push("/admin/users/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataTable
        data={users as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="username"
        searchPlaceholder="Search by username..."
        actions={(user) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/users/${(user as unknown as User).id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      />
    </div>
  );
}
