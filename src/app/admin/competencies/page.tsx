"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Cluster {
  id: number;
  name: string;
  type: string | null;
  families: Family[];
}

interface Family {
  id: number;
  name: string;
  type: string | null;
  clusterId: number;
  cluster?: Cluster;
  groups: Group[];
}

interface Group {
  id: string;
  name: string;
  type: string | null;
  familyId: number;
  family?: Family & { cluster?: Cluster };
}

interface Manager {
  id: number;
  username: string;
  lastNameFirstName: string | null;
}

interface Competence {
  id: string;
  name: string;
  description: string | null;
  type: string;
  indicatorLevel: number | null;
  indicatorName: string | null;
  passingIndicator: number | null;
  competenceGroupId: string;
  competenceGroup: Group & { family: Family & { cluster: Cluster } };
  responsibleManager: { id: number; username: string; lastNameFirstName: string | null } | null;
  _count: { questions: number };
}

// ─── Cluster Tab ──────────────────────────────────────────────────────────────

function ClustersTab({
  clusters,
  onReload,
}: {
  clusters: Cluster[];
  onReload: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setName("");
    setType("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: Cluster) {
    setEditingId(c.id);
    setName(c.name);
    setType(c.type ?? "");
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = { name, type: type || null };
    const url = editingId
      ? `/api/competence-clusters/${editingId}`
      : "/api/competence-clusters";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setShowForm(false);
    onReload();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this cluster?")) return;
    const res = await fetch(`/api/competence-clusters/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onReload();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    {
      key: "type",
      label: "Type",
      render: (item) => {
        const t = item.type as string | null;
        if (!t) return "—";
        return (
          <Badge variant={t === "HSE" ? "destructive" : "default"}>{t}</Badge>
        );
      },
    },
    {
      key: "families",
      label: "Families",
      render: (item) => (item.families as Family[])?.length ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Top-level grouping of competencies
        </p>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Cluster
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit Cluster" : "Create Cluster"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cluster-name">Name *</Label>
                <Input
                  id="cluster-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cluster-type">Type</Label>
                <select
                  id="cluster-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="HSE">HSE</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Cluster"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={clusters as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search clusters..."
        actions={(item) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(item as unknown as Cluster)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete((item as unknown as Cluster).id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}

// ─── Families Tab ─────────────────────────────────────────────────────────────

function FamiliesTab({
  families,
  clusters,
  onReload,
}: {
  families: Family[];
  clusters: Cluster[];
  onReload: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [clusterId, setClusterId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setName("");
    setType("");
    setClusterId("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(f: Family) {
    setEditingId(f.id);
    setName(f.name);
    setType(f.type ?? "");
    setClusterId(f.clusterId.toString());
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = {
      name,
      type: type || null,
      clusterId: Number(clusterId),
    };
    const url = editingId
      ? `/api/competence-families/${editingId}`
      : "/api/competence-families";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setShowForm(false);
    onReload();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this family?")) return;
    const res = await fetch(`/api/competence-families/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onReload();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    {
      key: "type",
      label: "Type",
      render: (item) => {
        const t = item.type as string | null;
        if (!t) return "—";
        return (
          <Badge variant={t === "HSE" ? "destructive" : "default"}>{t}</Badge>
        );
      },
    },
    {
      key: "cluster",
      label: "Cluster",
      render: (item) => (item.cluster as Cluster)?.name ?? "—",
    },
    {
      key: "groups",
      label: "Groups",
      render: (item) => (item.groups as Group[])?.length ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Group competencies into families within clusters
        </p>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Family
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit Family" : "Create Family"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="family-name">Name *</Label>
                <Input
                  id="family-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family-type">Type</Label>
                <select
                  id="family-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="HSE">HSE</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="family-cluster">Cluster *</Label>
                <select
                  id="family-cluster"
                  value={clusterId}
                  onChange={(e) => setClusterId(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Select —</option>
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Family"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={families as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search families..."
        actions={(item) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(item as unknown as Family)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete((item as unknown as Family).id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}

// ─── Groups Tab ───────────────────────────────────────────────────────────────

function GroupsTab({
  groups,
  families,
  onReload,
}: {
  groups: Group[];
  families: Family[];
  onReload: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setName("");
    setType("");
    setFamilyId("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(g: Group) {
    setEditingId(g.id);
    setName(g.name);
    setType(g.type ?? "");
    setFamilyId(g.familyId.toString());
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = {
      name,
      type: type || null,
      familyId: Number(familyId),
    };
    const url = editingId
      ? `/api/competence-groups/${editingId}`
      : "/api/competence-groups";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setShowForm(false);
    onReload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this group?")) return;
    const res = await fetch(`/api/competence-groups/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onReload();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: "name", label: "Name", sortable: true },
    {
      key: "type",
      label: "Type",
      render: (item) => {
        const t = item.type as string | null;
        if (!t) return "—";
        return (
          <Badge variant={t === "HSE" ? "destructive" : "default"}>{t}</Badge>
        );
      },
    },
    {
      key: "family",
      label: "Family",
      render: (item) => {
        const f = item.family as Family & { cluster?: Cluster };
        return f ? `${f.cluster?.name ?? ""} › ${f.name}` : "—";
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Groups hold individual competencies
        </p>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Group
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit Group" : "Create Group"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Name *</Label>
                <Input
                  id="group-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-type">Type</Label>
                <select
                  id="group-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="HSE">HSE</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-family">Family *</Label>
                <select
                  id="group-family"
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Select —</option>
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.cluster?.name ? `${f.cluster.name} › ` : ""}
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Group"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={groups as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search groups..."
        actions={(item) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(item as unknown as Group)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete((item as unknown as Group).id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}

// ─── Competencies Tab ─────────────────────────────────────────────────────────

function CompetenciesTab({
  competencies,
  groups,
  managers,
  onReload,
}: {
  competencies: Competence[];
  groups: Group[];
  managers: Manager[];
  onReload: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("PROFESSIONAL");
  const [indicatorLevel, setIndicatorLevel] = useState("");
  const [indicatorName, setIndicatorName] = useState("");
  const [passingIndicator, setPassingIndicator] = useState("");
  const [groupId, setGroupId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setName("");
    setDescription("");
    setType("PROFESSIONAL");
    setIndicatorLevel("");
    setIndicatorName("");
    setPassingIndicator("");
    setGroupId("");
    setManagerId("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: Competence) {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description ?? "");
    setType(c.type);
    setIndicatorLevel(c.indicatorLevel?.toString() ?? "");
    setIndicatorName(c.indicatorName ?? "");
    setPassingIndicator(c.passingIndicator?.toString() ?? "");
    setGroupId(c.competenceGroupId);
    setManagerId(c.responsibleManager?.id?.toString() ?? "");
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = {
      name,
      description: description || null,
      type,
      indicatorLevel: indicatorLevel ? Number(indicatorLevel) : null,
      indicatorName: indicatorName || null,
      passingIndicator: passingIndicator ? Number(passingIndicator) : null,
      competenceGroupId: groupId,
      responsibleManagerId: managerId ? Number(managerId) : null,
    };
    const url = editingId
      ? `/api/competencies/${editingId}`
      : "/api/competencies";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setShowForm(false);
    onReload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this competence?")) return;
    const res = await fetch(`/api/competencies/${id}`, { method: "DELETE" });
    if (res.ok) {
      onReload();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: "name", label: "Name", sortable: true },
    {
      key: "type",
      label: "Type",
      render: (item) => {
        const t = (item as unknown as Competence).type;
        return (
          <Badge variant={t === "HSE" ? "destructive" : "default"}>{t}</Badge>
        );
      },
    },
    {
      key: "group",
      label: "Group",
      render: (item) => {
        const c = item as unknown as Competence;
        const g = c.competenceGroup;
        return g
          ? `${g.family?.cluster?.name ?? ""} › ${g.family?.name ?? ""} › ${g.name}`
          : "—";
      },
    },
    {
      key: "passingIndicator",
      label: "Passing",
      render: (item) => {
        const c = item as unknown as Competence;
        return c.passingIndicator != null ? `${c.passingIndicator}%` : "—";
      },
    },
    {
      key: "questions",
      label: "Questions",
      render: (item) => (item as unknown as Competence)._count?.questions ?? 0,
    },
    {
      key: "manager",
      label: "Manager",
      render: (item) => {
        const m = (item as unknown as Competence).responsibleManager;
        return m ? m.lastNameFirstName || m.username : "—";
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Individual competencies with scoring and question configuration
        </p>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Competence
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit Competence" : "Create Competence"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comp-name">Name *</Label>
                <Input
                  id="comp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comp-type">Type *</Label>
                <select
                  id="comp-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="HSE">HSE</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comp-desc">Description</Label>
              <textarea
                id="comp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comp-group">Group *</Label>
                <select
                  id="comp-group"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Select —</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.family?.cluster?.name
                        ? `${g.family.cluster.name} › ${g.family.name} › `
                        : ""}
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comp-level">Indicator Level</Label>
                <Input
                  id="comp-level"
                  type="number"
                  value={indicatorLevel}
                  onChange={(e) => setIndicatorLevel(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comp-passing">Passing Indicator (%)</Label>
                <Input
                  id="comp-passing"
                  type="number"
                  value={passingIndicator}
                  onChange={(e) => setPassingIndicator(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comp-manager">Responsible Manager</Label>
                <select
                  id="comp-manager"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.lastNameFirstName || m.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comp-indicator-name">Indicator Name</Label>
              <Input
                id="comp-indicator-name"
                value={indicatorName}
                onChange={(e) => setIndicatorName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Competence"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={competencies as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search competencies..."
        actions={(item) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(item as unknown as Competence)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete((item as unknown as Competence).id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompetenciesPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [competencies, setCompetencies] = useState<Competence[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/competence-clusters").then((r) => r.json()),
      fetch("/api/competence-families").then((r) => r.json()),
      fetch("/api/competence-groups").then((r) => r.json()),
      fetch("/api/competencies").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([cls, fam, grp, comp, users]) => {
      setClusters(Array.isArray(cls) ? cls : []);
      setFamilies(Array.isArray(fam) ? fam : []);
      setGroups(Array.isArray(grp) ? grp : []);
      setCompetencies(Array.isArray(comp) ? comp : []);
      // Filter to managers only
      const userList = Array.isArray(users) ? users : [];
      const mgrs = (userList as { id: number; username: string; lastNameFirstName: string | null; roles: { role: { name: string } }[] }[])
        .filter((u) => u.roles?.some((r) => r.role.name === "MANAGER" || r.role.name === "ADMIN"))
        .map((u) => ({
          id: u.id,
          username: u.username,
          lastNameFirstName: u.lastNameFirstName,
        }));
      setManagers(mgrs);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Competencies</h1>
        <p className="text-sm text-muted-foreground">
          Manage the competency catalog: clusters, families, groups, and
          individual competencies
        </p>
      </div>

      <Tabs defaultValue="competencies" className="w-full">
        <TabsList>
          <TabsTrigger value="competencies">
            Competencies ({competencies.length})
          </TabsTrigger>
          <TabsTrigger value="clusters">
            Clusters ({clusters.length})
          </TabsTrigger>
          <TabsTrigger value="families">
            Families ({families.length})
          </TabsTrigger>
          <TabsTrigger value="groups">Groups ({groups.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="competencies" className="mt-6">
          <CompetenciesTab
            competencies={competencies}
            groups={groups}
            managers={managers}
            onReload={loadData}
          />
        </TabsContent>

        <TabsContent value="clusters" className="mt-6">
          <ClustersTab clusters={clusters} onReload={loadData} />
        </TabsContent>

        <TabsContent value="families" className="mt-6">
          <FamiliesTab
            families={families}
            clusters={clusters}
            onReload={loadData}
          />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <GroupsTab
            groups={groups}
            families={families}
            onReload={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
