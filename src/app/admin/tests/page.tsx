"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Settings2, Play, Users, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompetenceBrief {
  id: string;
  name: string;
  type: string;
}

interface TemplateCompetence {
  id: number;
  competenceId: string;
  numberOfQuestions: number;
  competence: CompetenceBrief;
}

interface Template {
  id: number;
  name: string;
  createdAt: string;
  competences: TemplateCompetence[];
  _count: { tests: number };
}

interface HseGroup {
  id: string;
  name: string;
}

interface TestData {
  id: number;
  name: string;
  description: string | null;
  type: string;
  totalTime: number | null;
  iteration: number;
  createdAt: string;
  testTemplate: { id: number; name: string; competences: { competence: { id: string; name: string } }[] } | null;
  hseGroup: { id: string; name: string } | null;
  _count: { questions: number; assignedUsers: number; results: number };
}

interface UserBrief {
  id: number;
  username: string;
  lastNameFirstName: string | null;
}

// ─── Templates Tab ───────────────────────────────────────────────────────────

function TemplatesTab({
  templates,
  competencies,
  onReload,
}: {
  templates: Template[];
  competencies: CompetenceBrief[];
  onReload: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Competences config
  const [managingId, setManagingId] = useState<number | null>(null);
  const [templateCompetences, setTemplateCompetences] = useState<
    { competenceId: string; numberOfQuestions: number }[]
  >([]);
  const [savingCompetences, setSavingCompetences] = useState(false);

  function openCreate() {
    setEditingId(null);
    setName("");
    setError(null);
    setShowForm(true);
    setManagingId(null);
  }

  function openEdit(t: Template) {
    setEditingId(t.id);
    setName(t.name);
    setError(null);
    setShowForm(true);
    setManagingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const url = editingId
      ? `/api/test-templates/${editingId}`
      : "/api/test-templates";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
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
    if (!confirm("Delete this template?")) return;
    const res = await fetch(`/api/test-templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      onReload();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  function openManageCompetences(t: Template) {
    setManagingId(t.id);
    setShowForm(false);
    setTemplateCompetences(
      t.competences.map((c) => ({
        competenceId: c.competenceId,
        numberOfQuestions: c.numberOfQuestions,
      }))
    );
  }

  function addCompetence() {
    setTemplateCompetences((prev) => [
      ...prev,
      { competenceId: "", numberOfQuestions: 1 },
    ]);
  }

  function removeCompetence(idx: number) {
    setTemplateCompetences((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateCompetence(
    idx: number,
    field: "competenceId" | "numberOfQuestions",
    value: string | number
  ) {
    setTemplateCompetences((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  }

  async function saveCompetences() {
    if (!managingId) return;
    const valid = templateCompetences.filter((c) => c.competenceId);
    setSavingCompetences(true);
    const res = await fetch(`/api/test-templates/${managingId}/competences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competences: valid }),
    });
    setSavingCompetences(false);
    if (res.ok) {
      setManagingId(null);
      onReload();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to save");
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    {
      key: "competences",
      label: "Competences",
      render: (item) => (item as unknown as Template).competences.length,
    },
    {
      key: "totalQuestions",
      label: "Total Questions",
      render: (item) => {
        const t = item as unknown as Template;
        return t.competences.reduce((sum, c) => sum + c.numberOfQuestions, 0);
      },
    },
    {
      key: "tests",
      label: "Tests",
      render: (item) => (item as unknown as Template)._count.tests,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (item) =>
        new Date((item as unknown as Template).createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Reusable test templates with competency and question count configuration
        </p>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit Template" : "Create Template"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tmpl-name">Name *</Label>
              <Input
                id="tmpl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Template"}
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

      {managingId && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Configure Competences —{" "}
              {templates.find((t) => t.id === managingId)?.name}
            </h2>
            <div className="flex gap-3">
              <Button
                onClick={saveCompetences}
                disabled={savingCompetences}
              >
                <Check className="mr-2 h-4 w-4" />
                {savingCompetences ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setManagingId(null)}>
                Cancel
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {templateCompetences.map((tc, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <select
                  value={tc.competenceId}
                  onChange={(e) =>
                    updateCompetence(idx, "competenceId", e.target.value)
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Select Competence —</option>
                  {competencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.type}] {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex shrink-0 items-center gap-2">
                  <Label className="shrink-0 text-sm">Questions:</Label>
                  <Input
                    type="number"
                    min="1"
                    value={tc.numberOfQuestions}
                    onChange={(e) =>
                      updateCompetence(
                        idx,
                        "numberOfQuestions",
                        Number(e.target.value) || 1
                      )
                    }
                    className="h-10 w-20"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCompetence(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addCompetence}>
              <Plus className="mr-1 h-3 w-3" />
              Add Competence
            </Button>
          </div>
        </div>
      )}

      <DataTable
        data={templates as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search templates..."
        actions={(item) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                openManageCompetences(item as unknown as Template)
              }
              title="Configure Competences"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(item as unknown as Template)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete((item as unknown as Template).id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}

// ─── Tests Tab ───────────────────────────────────────────────────────────────

function TestsTab({
  tests,
  templates,
  hseGroups,
  users,
  onReload,
}: {
  tests: TestData[];
  templates: Template[];
  hseGroups: HseGroup[];
  users: UserBrief[];
  onReload: () => void;
}) {
  const [showGenerate, setShowGenerate] = useState(false);
  const [genName, setGenName] = useState("");
  const [genDescription, setGenDescription] = useState("");
  const [genTemplateId, setGenTemplateId] = useState("");
  const [genType, setGenType] = useState("TECHNICAL");
  const [genTotalTime, setGenTotalTime] = useState("");
  const [genHseGroupId, setGenHseGroupId] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Assignment
  const [assigningTestId, setAssigningTestId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [assigning, setAssigning] = useState(false);

  function openGenerate() {
    setGenName("");
    setGenDescription("");
    setGenTemplateId("");
    setGenType("TECHNICAL");
    setGenTotalTime("");
    setGenHseGroupId("");
    setGenError(null);
    setShowGenerate(true);
    setAssigningTestId(null);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenError(null);

    if (!genTemplateId) {
      setGenError("Please select a template");
      return;
    }

    setGenerating(true);
    const res = await fetch("/api/tests/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testTemplateId: Number(genTemplateId),
        name: genName,
        description: genDescription || null,
        type: genType,
        totalTime: genTotalTime ? Number(genTotalTime) : null,
        hseGroupId: genHseGroupId || null,
      }),
    });
    const data = await res.json();
    setGenerating(false);

    if (!res.ok) {
      setGenError(data.error);
      return;
    }

    setShowGenerate(false);
    onReload();
  }

  async function openAssign(testId: number) {
    setAssigningTestId(testId);
    setShowGenerate(false);
    setSelectedUserIds([]);

    // Load already-assigned users
    const res = await fetch(`/api/tests/${testId}/assign`);
    if (res.ok) {
      const data = await res.json();
      setSelectedUserIds(
        (data as { userProfile: { id: number } }[]).map(
          (a) => a.userProfile.id
        )
      );
    }
  }

  function toggleUser(id: number) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleAssign() {
    if (!assigningTestId) return;
    setAssigning(true);
    const res = await fetch(`/api/tests/${assigningTestId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: selectedUserIds }),
    });
    setAssigning(false);
    if (res.ok) {
      setAssigningTestId(null);
      onReload();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to assign");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this test?")) return;
    const res = await fetch(`/api/tests/${id}`, { method: "DELETE" });
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
        const t = (item as unknown as TestData).type;
        return (
          <Badge variant={t === "HSE" ? "destructive" : "default"}>{t}</Badge>
        );
      },
    },
    {
      key: "template",
      label: "Template",
      render: (item) =>
        (item as unknown as TestData).testTemplate?.name ?? "—",
    },
    {
      key: "competences",
      label: "Competences",
      render: (item) => {
        const t = item as unknown as TestData;
        const comps = t.testTemplate?.competences ?? [];
        if (comps.length === 0) return "—";
        return (
          <span title={comps.map((c) => c.competence.name).join(", ")}>
            {comps.length <= 2
              ? comps.map((c) => c.competence.name).join(", ")
              : `${comps[0].competence.name} +${comps.length - 1} more`}
          </span>
        );
      },
    },
    {
      key: "questions",
      label: "Questions",
      render: (item) => (item as unknown as TestData)._count.questions,
    },
    {
      key: "assigned",
      label: "Assigned",
      render: (item) => (item as unknown as TestData)._count.assignedUsers,
    },
    {
      key: "results",
      label: "Results",
      render: (item) => (item as unknown as TestData)._count.results,
    },
    {
      key: "iteration",
      label: "Iteration",
      render: (item) => {
        const it = (item as unknown as TestData).iteration;
        return it > 0 ? <Badge variant="outline">Retake {it}</Badge> : "—";
      },
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (item) =>
        new Date((item as unknown as TestData).createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Generated tests with assignment and status tracking
        </p>
        <Button onClick={openGenerate}>
          <Play className="mr-2 h-4 w-4" />
          Generate Test
        </Button>
      </div>

      {showGenerate && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Generate Test</h2>
          {genError && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {genError}
            </div>
          )}
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gen-name">Test Name *</Label>
                <Input
                  id="gen-name"
                  value={genName}
                  onChange={(e) => setGenName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gen-template">Template *</Label>
                <select
                  id="gen-template"
                  value={genTemplateId}
                  onChange={(e) => setGenTemplateId(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Select Template —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.competences.length} competences)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gen-type">Type *</Label>
                <select
                  id="gen-type"
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="HSE">HSE</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gen-time">Total Time (minutes)</Label>
                <Input
                  id="gen-time"
                  type="number"
                  min="1"
                  value={genTotalTime}
                  onChange={(e) => setGenTotalTime(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gen-hse">HSE Group</Label>
                <select
                  id="gen-hse"
                  value={genHseGroupId}
                  onChange={(e) => setGenHseGroupId(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  {hseGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gen-desc">Description</Label>
              <Input
                id="gen-desc"
                value={genDescription}
                onChange={(e) => setGenDescription(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={generating}>
                {generating ? "Generating..." : "Generate Test"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGenerate(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {assigningTestId && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Assign Users —{" "}
              {tests.find((t) => t.id === assigningTestId)?.name}
            </h2>
            <div className="flex gap-3">
              <Button onClick={handleAssign} disabled={assigning}>
                <Check className="mr-2 h-4 w-4" />
                {assigning ? "Assigning..." : "Assign"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setAssigningTestId(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u.id)}
                    onChange={() => toggleUser(u.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {u.lastNameFirstName || u.username}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <DataTable
        data={tests as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search tests..."
        actions={(item) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openAssign((item as unknown as TestData).id)}
              title="Assign Users"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete((item as unknown as TestData).id)}
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

export default function TestsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tests, setTests] = useState<TestData[]>([]);
  const [competencies, setCompetencies] = useState<CompetenceBrief[]>([]);
  const [hseGroups, setHseGroups] = useState<HseGroup[]>([]);
  const [users, setUsers] = useState<UserBrief[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/test-templates").then((r) => r.json()),
      fetch("/api/tests").then((r) => r.json()),
      fetch("/api/competencies").then((r) => r.json()),
      fetch("/api/hse-groups").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([tmpl, tst, comp, hse, usr]) => {
      setTemplates(Array.isArray(tmpl) ? tmpl : []);
      setTests(Array.isArray(tst) ? tst : []);
      setCompetencies(
        Array.isArray(comp)
          ? (comp as CompetenceBrief[]).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
            }))
          : []
      );
      setHseGroups(Array.isArray(hse) ? hse : []);
      setUsers(
        Array.isArray(usr)
          ? (usr as UserBrief[]).map((u) => ({
              id: u.id,
              username: u.username,
              lastNameFirstName: u.lastNameFirstName,
            }))
          : []
      );
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
        <h1 className="text-2xl font-bold text-foreground">Tests</h1>
        <p className="text-sm text-muted-foreground">
          Manage test templates, generate tests, and assign them to employees
        </p>
      </div>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList>
          <TabsTrigger value="tests">Tests ({tests.length})</TabsTrigger>
          <TabsTrigger value="templates">
            Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="mt-6">
          <TestsTab
            tests={tests}
            templates={templates}
            hseGroups={hseGroups}
            users={users}
            onReload={loadData}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesTab
            templates={templates}
            competencies={competencies}
            onReload={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
