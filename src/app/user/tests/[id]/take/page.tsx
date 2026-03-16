"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  GripVertical,
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  level: number;
  questionType: string;
  imagePath: string | null;
  possibleAnswers: string[];
  answerTime: number | null;
  competenceId: string;
}

interface TestData {
  id: number;
  name: string;
  description: string | null;
  type: string;
  totalTime: number | null;
  iteration: number;
  questions: Question[];
}

type AnswerValue = string | string[] | number[] | null;

export default function TakeTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, AnswerValue>>(new Map());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    fetch(`/api/tests/${testId}/take`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load test");
          return;
        }
        setTest(data);
        if (data.totalTime) {
          setTimeLeft(data.totalTime * 60); // convert minutes to seconds
        }
      })
      .catch(() => setError("Failed to load test"))
      .finally(() => setLoading(false));
  }, [testId]);

  const submitTest = useCallback(
    async (stopped: boolean) => {
      if (submitting || !test) return;
      setSubmitting(true);

      const answerPayload = test.questions.map((q) => ({
        questionId: q.id,
        answer: answers.get(q.id) ?? null,
      }));

      try {
        const res = await fetch(`/api/tests/${testId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answerPayload,
            remainingTime: timeLeft,
            stopped,
          }),
        });

        if (res.ok) {
          router.push(`/user/tests/${testId}/results`);
        } else {
          const data = await res.json();
          setError(data.error ?? "Failed to submit test");
          setSubmitting(false);
        }
      } catch {
        setError("Failed to submit test");
        setSubmitting(false);
      }
    },
    [submitting, test, answers, testId, timeLeft, router]
  );

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!autoSubmitRef.current) {
            autoSubmitRef.current = true;
            // Use setTimeout to avoid state update during render
            setTimeout(() => submitTest(true), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft === null]); // eslint-disable-line react-hooks/exhaustive-deps

  function setAnswer(questionId: number, value: AnswerValue) {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, value);
      return next;
    });
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading test...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium">{error}</p>
        <Button variant="outline" onClick={() => router.push("/user/tests")}>
          Back to My Tests
        </Button>
      </div>
    );
  }

  if (!test) return null;

  const question = test.questions[currentIndex];
  const totalQuestions = test.questions.length;
  const answeredCount = test.questions.filter((q) => answers.has(q.id)).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div>
          <h1 className="font-semibold text-foreground">{test.name}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions} &middot; {answeredCount} answered
          </p>
        </div>
        {timeLeft !== null && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold ${
              timeLeft < 60 ? "bg-red-50 text-red-600" : "bg-muted text-foreground"
            }`}
          >
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress */}
      <Progress value={progressPercent} className="h-2" />

      {/* Question navigator */}
      <div className="flex flex-wrap gap-1">
        {test.questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(idx)}
            className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
              idx === currentIndex
                ? "bg-blue-600 text-white"
                : answers.has(q.id)
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Level {question.level}</Badge>
            <Badge variant="secondary">{question.questionType.replace("_", " ")}</Badge>
          </div>
          <CardTitle className="text-lg leading-relaxed">{question.text}</CardTitle>
          {question.imagePath && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.imagePath}
                alt="Question image"
                className="max-h-64 rounded-lg border object-contain"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <QuestionInput
            question={question}
            value={answers.get(question.id) ?? null}
            onChange={(val) => setAnswer(question.id, val)}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {currentIndex < totalQuestions - 1 ? (
          <Button onClick={() => setCurrentIndex((i) => i + 1)}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
          >
            <Send className="mr-1 h-4 w-4" />
            Submit Test
          </Button>
        )}
      </div>

      {/* Submit confirmation */}
      {showConfirm && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Submit this test?</p>
                <p className="text-sm text-amber-700">
                  You have answered {answeredCount} of {totalQuestions} questions.
                  {answeredCount < totalQuestions && (
                    <span className="font-medium">
                      {" "}
                      {totalQuestions - answeredCount} question(s) are unanswered.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Continue Test
              </Button>
              <Button
                onClick={() => submitTest(false)}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Confirm Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Question Input Components ──────────────────────────────────────────────

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue;
  onChange: (val: AnswerValue) => void;
}) {
  switch (question.questionType) {
    case "SINGLE_CHOICE":
      return (
        <SingleChoiceInput
          options={question.possibleAnswers}
          value={typeof value === "string" ? value : null}
          onChange={onChange}
        />
      );
    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceInput
          options={question.possibleAnswers}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );
    case "ORDERING":
      return (
        <OrderingInput
          options={question.possibleAnswers}
          value={Array.isArray(value) ? (value as number[]) : null}
          onChange={onChange}
        />
      );
    case "IMAGE_PLACEMENT":
      return (
        <ImagePlacementInput
          options={question.possibleAnswers}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );
    default:
      return <p className="text-muted-foreground">Unknown question type</p>;
  }
}

function SingleChoiceInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (val: string) => void;
}) {
  return (
    <RadioGroup value={value ?? ""} onValueChange={onChange}>
      <div className="space-y-2">
        {options.map((option, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
              value === option ? "border-blue-500 bg-blue-50" : "hover:bg-muted/50"
            }`}
            onClick={() => onChange(option)}
          >
            <RadioGroupItem value={option} id={`opt-${idx}`} />
            <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}

function MultipleChoiceInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
}) {
  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
      {options.map((option, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
            value.includes(option) ? "border-blue-500 bg-blue-50" : "hover:bg-muted/50"
          }`}
          onClick={() => toggle(option)}
        >
          <Checkbox
            checked={value.includes(option)}
            onCheckedChange={() => toggle(option)}
            id={`mc-${idx}`}
          />
          <Label htmlFor={`mc-${idx}`} className="flex-1 cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
}

function OrderingInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: number[] | null;
  onChange: (val: number[]) => void;
}) {
  // Initialize order if not set
  const order = value ?? options.map((_, i) => i);

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...order];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  }

  function moveDown(idx: number) {
    if (idx === options.length - 1) return;
    const next = [...order];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-2">
        Arrange items in the correct order using the arrow buttons
      </p>
      {order.map((optIdx, pos) => (
        <div
          key={pos}
          className="flex items-center gap-2 rounded-lg border p-3 bg-card"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">{options[optIdx]}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={pos === 0}
              onClick={() => moveUp(pos)}
              className="h-7 w-7 p-0"
            >
              &uarr;
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pos === options.length - 1}
              onClick={() => moveDown(pos)}
              className="h-7 w-7 p-0"
            >
              &darr;
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ImagePlacementInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
}) {
  // Simplified: select answer for each placement zone
  const current = value.length === options.length ? value : options.map(() => "");

  function setZone(idx: number, val: string) {
    const next = [...current];
    next[idx] = val;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-2">
        Assign the correct label to each zone
      </p>
      {options.map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 rounded-lg border p-3">
          <Badge variant="outline">Zone {idx + 1}</Badge>
          <select
            value={current[idx]}
            onChange={(e) => setZone(idx, e.target.value)}
            className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">-- Select --</option>
            {options.map((opt, oi) => (
              <option key={oi} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
