"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface HseGroup {
  id: number;
  name: string;
}
interface Position {
  id: string;
  name: string;
  hseGroup: HseGroup | null;
}

const columns: Column<Position>[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Name", sortable: true },
  {
    key: "hseGroup",
    label: "HSE Group",
    render: (p) => p.hseGroup?.name ?? "—",
  },
];

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [hseGroups, setHseGroups] = useState<HseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formHseGroupId, setFormHseGroupId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function loadData() {
    Promise.all([
      fetch("/api/positions").then((r) => r.json()),
      fetch("/api/hse-groups").then((r) => r.json()),
    ]).then(([pos, groups]) => {
      setPositions(pos);
      setHseGroups(groups);
      setLoading(false);
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditingId(null);
    setFormName("");
    setFormHseGroupId("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(p: Position) {
    setEditingId(p.id);
    setFormName(p.name);
    setFormHseGroupId(p.hseGroup?.id?.toString() ?? "");
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const body = {
      name: formName,
      hseGroupId: formHseGroupId ? Number(formHseGroupId) : null,
    };

    const url = editingId ? `/api/positions/${editingId}` : "/api/positions";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? body : { id: formName.toUpperCase().replace(/\s+/g, "_"), ...body }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    setShowForm(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this position?")) return;
    const res = await fetch(`/api/positions/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Positions</h1>
          <p className="text-sm text-muted-foreground">Manage job positions</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit Position" : "Create Position"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hseGroupId">HSE Group</Label>
                <select
                  id="hseGroupId"
                  value={formHseGroupId}
                  onChange={(e) => setFormHseGroupId(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  {hseGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Position"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={positions as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="name"
        searchPlaceholder="Search by name..."
        actions={(pos) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(pos as unknown as Position)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete((pos as unknown as Position).id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}
