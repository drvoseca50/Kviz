"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Position {
  id: string;
  name: string;
}
interface OrgUnit {
  id: number;
  name: string;
}

export default function NewUserPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/positions").then((r) => r.json()),
      fetch("/api/organisational-units").then((r) => r.json()),
    ]).then(([pos, units]) => {
      setPositions(pos);
      setOrgUnits(units);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    const body = {
      username: fd.get("username") as string,
      email: (fd.get("email") as string) || null,
      password: fd.get("password") as string,
      lastNameFirstName: (fd.get("lastNameFirstName") as string) || null,
      sapId: Number(fd.get("sapId")),
      phone: (fd.get("phone") as string) || null,
      positionId: (fd.get("positionId") as string) || null,
      organisationalUnitId: fd.get("organisationalUnitId")
        ? Number(fd.get("organisationalUnitId"))
        : null,
    };

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/admin/users");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Create User</h1>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input id="username" name="username" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sapId">SAP ID *</Label>
              <Input id="sapId" name="sapId" type="number" required className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastNameFirstName">Full Name</Label>
            <Input id="lastNameFirstName" name="lastNameFirstName" className="h-11" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Min 15 chars, uppercase, lowercase, special"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positionId">Position</Label>
              <select
                id="positionId"
                name="positionId"
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
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— None —</option>
                {orgUnits.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
