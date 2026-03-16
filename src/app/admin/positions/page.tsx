"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Settings2, Check } from "lucide-react";

interface HseGroup {
  id: string;
  name: string;
}
interface Position {
  id: string;
  name: string;
  hseGroup: HseGroup | null;
  _count?: { competences: number };
}
interface CompetenceItem {
  id: string;
  name: string;
  type: string;
}

const columns: Column<Position>[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Name", sortable: true },
  {
    key: "hseGroup",
    label: "HSE Group",
    render: (p) => p.hseGroup?.name ?? "—",
  },
  {
    key: "competences" as keyof Position,
    label: "Competences",
    render: (p) => p._count?.competences ?? 0,
  },
];

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [hseGroups, setHseGroups] = useState<HseGroup[]>([]);
  const [competencies, setCompetencies] = useState<CompetenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formHseGroupId, setFormHseGroupId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [managingId, setManagingId] = useState<string | null>(null);
  const [selectedCompetenceIds, setSelectedCompetenceIds] = useState<string[]>([]);
  const [savingCompetences, setSavingCompetences] = useState(false);

  const professionalCompetencies = competencies.filter((c) => c.type === "PROFESSIONAL");

  function loadData() {
    Promise.all([
      fetch("/api/positions").then((r) => r.json()),
      fetch("/api/hse-groups").then((r) => r.json()),
      fetch("/api/competencies").then((r) => r.json()),
    ]).then(([pos, groups, comp]) => {
      setPositions(Array.isArray(pos) ? pos : []);
      setHseGroups(Array.isArray(groups) ? groups : []);
      setCompetencies(Array.isArray(comp) ? comp : []);
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
      hseGroupId: formHseGroupId || null,
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

  async function openManageCompetences(id: string) {
    setManagingId(id);
    setShowForm(false);
    const res = await fetch(`/api/positions/${id}/competences`);
    const data = await res.json();
    if (res.ok) {
      setSelectedCompetenceIds(
        (data as CompetenceItem[]).map((c) => c.id)
      );
    }
  }

  function toggleCompetence(id: string) {
    setSelectedCompetenceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function saveCompetences() {
    if (!managingId) return;
    setSavingCompetences(true);
    const res = await fetch(`/api/positions/${managingId}/competences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competenceIds: selectedCompetenceIds }),
    });
    setSavingCompetences(false);
    if (res.ok) {
      setManagingId(null);
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to save");
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

      {managingId && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Manage Competences — {positions.find((p) => p.id === managingId)?.name}
            </h2>
            <div className="flex gap-3">
              <Button onClick={saveCompetences} disabled={savingCompetences}>
                <Check className="mr-2 h-4 w-4" />
                {savingCompetences ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setManagingId(null)}>
                Cancel
              </Button>
            </div>
          </div>
          {professionalCompetencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No professional competencies defined yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {professionalCompetencies.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedCompetenceIds.includes(c.id)}
                    onChange={() => toggleCompetence(c.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
          )}
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
              onClick={() => openManageCompetences((pos as unknown as Position).id)}
              title="Manage Competences"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
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
