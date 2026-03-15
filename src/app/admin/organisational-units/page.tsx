"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface OrgUnit {
  id: number;
  name: string;
  parentId: number | null;
  parent: { name: string } | null;
}

const columns: Column<OrgUnit>[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Name", sortable: true },
  {
    key: "parent",
    label: "Parent Unit",
    render: (u) => u.parent?.name ?? "—",
  },
];

export default function OrgUnitsPage() {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function loadData() {
    fetch("/api/organisational-units")
      .then((r) => r.json())
      .then((data) => {
        setUnits(data);
        setLoading(false);
      });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditingId(null);
    setFormName("");
    setFormParentId("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(u: OrgUnit) {
    setEditingId(u.id);
    setFormName(u.name);
    setFormParentId(u.parentId?.toString() ?? "");
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const body = {
      name: formName,
      parentId: formParentId ? Number(formParentId) : null,
    };

    const url = editingId
      ? `/api/organisational-units/${editingId}`
      : "/api/organisational-units";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    setShowForm(false);
    loadData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    const res = await fetch(`/api/organisational-units/${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-bold text-foreground">Organisational Units</h1>
          <p className="text-sm text-muted-foreground">Manage departments and units</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Unit
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit Unit" : "Create Unit"}
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
                <Label htmlFor="parentId">Parent Unit</Label>
                <select
                  id="parentId"
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— None (Top Level) —</option>
                  {units
                    .filter((u) => u.id !== editingId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Unit"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={units as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="name"
        searchPlaceholder="Search by name..."
        actions={(unit) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(unit as unknown as OrgUnit)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete((unit as unknown as OrgUnit).id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}
