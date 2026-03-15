"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompetenceBrief {
  id: string;
  name: string;
  type: string;
}

interface Question {
  id: number;
  text: string;
  level: number;
  questionType: string;
  imagePath: string | null;
  possibleAnswers: string[];
  correctAnswers: (string | number)[];
  answerTime: number | null;
  competenceId: string;
  competence: CompetenceBrief;
}

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "ORDERING", label: "Ordering" },
  { value: "IMAGE_PLACEMENT", label: "Image Placement" },
];

function questionTypeLabel(t: string) {
  return QUESTION_TYPES.find((qt) => qt.value === t)?.label ?? t;
}

// ─── Answer Editor ────────────────────────────────────────────────────────────

function AnswerEditor({
  questionType,
  possibleAnswers,
  correctAnswers,
  onChange,
}: {
  questionType: string;
  possibleAnswers: string[];
  correctAnswers: (string | number)[];
  onChange: (possible: string[], correct: (string | number)[]) => void;
}) {
  function addAnswer() {
    onChange([...possibleAnswers, ""], correctAnswers);
  }

  function removeAnswer(idx: number) {
    const newPossible = possibleAnswers.filter((_, i) => i !== idx);
    const removedAnswer = possibleAnswers[idx];
    const newCorrect = correctAnswers.filter((a) => {
      if (questionType === "ORDERING") return (a as number) !== idx;
      return a !== removedAnswer;
    });
    onChange(newPossible, newCorrect);
  }

  function updateAnswer(idx: number, value: string) {
    const oldAnswer = possibleAnswers[idx];
    const newPossible = [...possibleAnswers];
    newPossible[idx] = value;

    // Update correct answers if it was referenced by value
    const newCorrect = correctAnswers.map((a) =>
      a === oldAnswer ? value : a
    );
    onChange(newPossible, newCorrect);
  }

  function toggleCorrect(answer: string) {
    if (questionType === "SINGLE_CHOICE") {
      onChange(possibleAnswers, [answer]);
    } else {
      const isCorrect = correctAnswers.includes(answer);
      if (isCorrect) {
        onChange(
          possibleAnswers,
          correctAnswers.filter((a) => a !== answer)
        );
      } else {
        onChange(possibleAnswers, [...correctAnswers, answer]);
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Answers</Label>
        <Button type="button" variant="outline" size="sm" onClick={addAnswer}>
          <Plus className="mr-1 h-3 w-3" />
          Add Answer
        </Button>
      </div>

      {possibleAnswers.map((answer, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {(questionType === "SINGLE_CHOICE" ||
            questionType === "MULTIPLE_CHOICE") && (
            <input
              type={
                questionType === "SINGLE_CHOICE" ? "radio" : "checkbox"
              }
              name="correct-answer"
              checked={correctAnswers.includes(answer)}
              onChange={() => toggleCorrect(answer)}
              className="h-4 w-4"
              title="Mark as correct"
            />
          )}
          {questionType === "ORDERING" && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-sm font-medium">
              {idx + 1}
            </span>
          )}
          <Input
            value={answer}
            onChange={(e) => updateAnswer(idx, e.target.value)}
            placeholder={`Answer ${idx + 1}`}
            className="h-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeAnswer(idx)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {questionType === "ORDERING" && possibleAnswers.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Enter answers in the correct order. The order shown here is the
          correct sequence.
        </p>
      )}

      {(questionType === "SINGLE_CHOICE" ||
        questionType === "MULTIPLE_CHOICE") &&
        possibleAnswers.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {questionType === "SINGLE_CHOICE"
              ? "Select the one correct answer"
              : "Select all correct answers"}
          </p>
        )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [competencies, setCompetencies] = useState<CompetenceBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCompetence, setFilterCompetence] = useState("");
  const [filterType, setFilterType] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [level, setLevel] = useState("1");
  const [questionType, setQuestionType] = useState("SINGLE_CHOICE");
  const [competenceId, setCompetenceId] = useState("");
  const [answerTime, setAnswerTime] = useState("");
  const [possibleAnswers, setPossibleAnswers] = useState<string[]>([""]);
  const [correctAnswers, setCorrectAnswers] = useState<(string | number)[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const params = new URLSearchParams();
    if (filterCompetence) params.set("competenceId", filterCompetence);
    if (filterType) params.set("questionType", filterType);

    Promise.all([
      fetch(`/api/questions?${params}`).then((r) => r.json()),
      fetch("/api/competencies").then((r) => r.json()),
    ]).then(([q, c]) => {
      setQuestions(Array.isArray(q) ? q : []);
      setCompetencies(
        Array.isArray(c)
          ? (c as CompetenceBrief[]).map((comp) => ({
              id: comp.id,
              name: comp.name,
              type: comp.type,
            }))
          : []
      );
      setLoading(false);
    });
  }, [filterCompetence, filterType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreate() {
    setEditingId(null);
    setText("");
    setLevel("1");
    setQuestionType("SINGLE_CHOICE");
    setCompetenceId("");
    setAnswerTime("");
    setPossibleAnswers([""]);
    setCorrectAnswers([]);
    setError(null);
    setShowForm(true);
  }

  function openEdit(q: Question) {
    setEditingId(q.id);
    setText(q.text);
    setLevel(q.level.toString());
    setQuestionType(q.questionType);
    setCompetenceId(q.competenceId);
    setAnswerTime(q.answerTime?.toString() ?? "");
    setPossibleAnswers(
      Array.isArray(q.possibleAnswers) ? q.possibleAnswers : []
    );
    setCorrectAnswers(
      Array.isArray(q.correctAnswers) ? q.correctAnswers : []
    );
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // For ordering type, correct answers = the indices in order
    let finalCorrect = correctAnswers;
    if (questionType === "ORDERING") {
      finalCorrect = possibleAnswers.map((_, i) => i);
    }

    if (
      (questionType === "SINGLE_CHOICE" ||
        questionType === "MULTIPLE_CHOICE") &&
      finalCorrect.length === 0
    ) {
      setError("Please select at least one correct answer");
      return;
    }

    const body = {
      text,
      level: Number(level),
      questionType,
      competenceId,
      answerTime: answerTime ? Number(answerTime) : null,
      possibleAnswers,
      correctAnswers: finalCorrect,
    };

    const url = editingId ? `/api/questions/${editingId}` : "/api/questions";
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
    loadData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this question?")) return;
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: "id", label: "ID", sortable: true },
    {
      key: "text",
      label: "Question",
      sortable: true,
      render: (item) => {
        const q = item as unknown as Question;
        const truncated =
          q.text.length > 80 ? q.text.substring(0, 80) + "..." : q.text;
        return <span title={q.text}>{truncated}</span>;
      },
    },
    {
      key: "competence",
      label: "Competence",
      render: (item) => {
        const q = item as unknown as Question;
        return q.competence?.name ?? "—";
      },
    },
    {
      key: "level",
      label: "Level",
      sortable: true,
      render: (item) => {
        const q = item as unknown as Question;
        return (
          <Badge variant="outline">Lvl {q.level}</Badge>
        );
      },
    },
    {
      key: "questionType",
      label: "Type",
      render: (item) => {
        const q = item as unknown as Question;
        return (
          <Badge variant="secondary">{questionTypeLabel(q.questionType)}</Badge>
        );
      },
    },
    {
      key: "answers",
      label: "Answers",
      render: (item) => {
        const q = item as unknown as Question;
        return Array.isArray(q.possibleAnswers)
          ? q.possibleAnswers.length
          : 0;
      },
    },
  ];

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Questions</h1>
          <p className="text-sm text-muted-foreground">
            Manage the question bank for competency assessments
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-64">
          <select
            value={filterCompetence}
            onChange={(e) => setFilterCompetence(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Competencies</option>
            {competencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            {QUESTION_TYPES.map((qt) => (
              <option key={qt.value} value={qt.value}>
                {qt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit Question" : "Create Question"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="q-text">Question Text *</Label>
              <textarea
                id="q-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="q-competence">Competence *</Label>
                <select
                  id="q-competence"
                  value={competenceId}
                  onChange={(e) => setCompetenceId(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Select —</option>
                  {competencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.type}] {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-type">Question Type *</Label>
                <select
                  id="q-type"
                  value={questionType}
                  onChange={(e) => {
                    setQuestionType(e.target.value);
                    setCorrectAnswers([]);
                  }}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {QUESTION_TYPES.map((qt) => (
                    <option key={qt.value} value={qt.value}>
                      {qt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-level">Difficulty Level *</Label>
                <Input
                  id="q-level"
                  type="number"
                  min="1"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-time">Answer Time (sec)</Label>
                <Input
                  id="q-time"
                  type="number"
                  min="1"
                  value={answerTime}
                  onChange={(e) => setAnswerTime(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <AnswerEditor
              questionType={questionType}
              possibleAnswers={possibleAnswers}
              correctAnswers={correctAnswers}
              onChange={(p, c) => {
                setPossibleAnswers(p);
                setCorrectAnswers(c);
              }}
            />

            <div className="flex gap-3">
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Question"}
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
        data={questions as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKey="text"
        searchPlaceholder="Search questions..."
        actions={(item) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(item as unknown as Question)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete((item as unknown as Question).id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}
