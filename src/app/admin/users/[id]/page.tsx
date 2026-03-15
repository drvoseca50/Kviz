"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Position {
  id: string;
  name: string;
}
interface OrgUnit {
  id: number;
  name: string;
}
interface Role {
  id: number;
  name: string;
}
interface UserDetail {
  id: number;
  username: string;
  email: string | null;
  lastNameFirstName: string | null;
  sapId: number;
  phone: string | null;
  hseBlocked: boolean;
  positionId: string | null;
  organisationalUnitId: number | null;
  managerId: number | null;
  hseManagerId: number | null;
  roles: { role: Role }[];
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${id}`).then((r) => r.json()),
      fetch("/api/positions").then((r) => r.json()),
      fetch("/api/organisational-units").then((r) => r.json()),
    ]).then(([u, pos, units]) => {
      setUser(u);
      setPositions(pos);
      setOrgUnits(units);
      // Derive all roles from user's roles endpoint
      fetch(`/api/users/${id}/roles`).then((r) => r.json()).then(setAllRoles);
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      email: (fd.get("email") as string) || null,
      lastNameFirstName: (fd.get("lastNameFirstName") as string) || null,
      phone: (fd.get("phone") as string) || null,
      positionId: (fd.get("positionId") as string) || null,
      organisationalUnitId: fd.get("organisationalUnitId")
        ? Number(fd.get("organisationalUnitId"))
        : null,
    };

    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSuccess("User updated successfully");
  }

  async function handleResetPassword() {
    const password = prompt("Enter new temporary password (min 15 chars, uppercase, lowercase, special):");
    if (!password) return;

    const res = await fetch(`/api/users/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      setSuccess("Password reset. User must change it on next login.");
    }
  }

  async function handleToggleRole(roleId: number, hasRole: boolean) {
    if (hasRole) {
      await fetch(`/api/users/${id}/roles?roleId=${roleId}`, { method: "DELETE" });
    } else {
      await fetch(`/api/users/${id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });
    }
    // Refresh roles
    const roles = await fetch(`/api/users/${id}/roles`).then((r) => r.json());
    setAllRoles(roles);
    if (user) {
      setUser({ ...user, roles: roles.map((r: Role) => ({ role: r })) });
    }
  }

  if (loading || !user) return <div className="text-muted-foreground">Loading...</div>;

  const userRoleIds = user.roles.map((r) => r.role.id);
  const availableRoles = [
    { id: 1, name: "ADMIN" },
    { id: 2, name: "MANAGER" },
    { id: 3, name: "USER" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Edit User: {user.username}</h1>
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          Back to Users
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">{success}</div>
      )}

      {/* User Details Form */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={user.username} disabled className="h-11 bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>SAP ID</Label>
              <Input value={user.sapId} disabled className="h-11 bg-gray-50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastNameFirstName">Full Name</Label>
            <Input
              id="lastNameFirstName"
              name="lastNameFirstName"
              defaultValue={user.lastNameFirstName ?? ""}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email ?? ""}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={user.phone ?? ""}
                className="h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positionId">Position</Label>
              <select
                id="positionId"
                name="positionId"
                defaultValue={user.positionId ?? ""}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— None —</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organisationalUnitId">Department</Label>
              <select
                id="organisationalUnitId"
                name="organisationalUnitId"
                defaultValue={user.organisationalUnitId ?? ""}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— None —</option>
                {orgUnits.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Roles */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Roles</h2>
        <div className="flex gap-3">
          {availableRoles.map((role) => {
            const has = userRoleIds.includes(role.id) ||
              allRoles.some((r) => r.name === role.name);
            return (
              <button
                key={role.id}
                onClick={() => handleToggleRole(role.id, has)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  has
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {role.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Password & Actions */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Actions</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleResetPassword}>
            Reset Password
          </Button>
          {user.hseBlocked && (
            <Badge variant="destructive" className="self-center">HSE Blocked</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
