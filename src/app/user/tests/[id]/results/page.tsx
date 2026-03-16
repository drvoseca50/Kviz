"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CompetenceBreakdown {
  competenceId: string;
  competenceName: string;
  passingIndicator: number | null;
  score: number | null;
  passed: boolean | null;
}

interface AnswerDetail {
  questionId: number;
  userAnswer: string | null;
  correct: boolean | null;
  question: {
    id: number;
    text: string;
    questionType: string;
    possibleAnswers: string[];
    correctAnswers: unknown;
    imagePath: string | null;
    competenceId: string;
  };
}

interface ResultData {
  testName: string;
  testType: string;
  result: {
    id: number;
    passed: boolean | null;
    percentage: number | null;
    dateTime: string;
    remainingTime: number | null;
    stopped: boolean;
  };
  answers: AnswerDetail[];
  competenceBreakdown: CompetenceBreakdown[];
}

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetch(`/api/tests/${testId}/results`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Failed to load results");
          return;
        }
        setData(json);
      })
      .catch(() => setError("Failed to load results"))
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-lg font-medium">{error ?? "No data"}</p>
        <Button variant="outline" onClick={() => router.push("/user/tests")}>
          Back to My Tests
        </Button>
      </div>
    );
  }

  const { result, competenceBreakdown, answers } = data;
  const passed = result.passed;
  const percentage = result.percentage ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" onClick={() => router.push("/user/tests")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Tests
      </Button>

      {/* Overall Result Card */}
      <Card
        className={
          passed
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }
      >
        <CardContent className="py-8 text-center space-y-4">
          {passed ? (
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
          )}
          <h1 className="text-2xl font-bold">
            {passed ? "Test Passed!" : "Test Failed"}
          </h1>
          <p className="text-4xl font-bold">{percentage}%</p>
          <p className="text-muted-foreground">{data.testName}</p>
          {result.stopped && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Auto-submitted (time expired)
            </Badge>
          )}
          <p className="text-sm text-muted-foreground">
            Completed: {new Date(result.dateTime).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Competence Breakdown */}
      {competenceBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competence Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {competenceBreakdown.map((cb) => (
              <div key={cb.competenceId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cb.competenceName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{cb.score ?? 0}%</span>
                    {cb.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Progress
                    value={cb.score ?? 0}
                    className="h-3"
                  />
                  {cb.passingIndicator && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                      style={{ left: `${cb.passingIndicator}%` }}
                      title={`Passing: ${cb.passingIndicator}%`}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Passing threshold: {cb.passingIndicator ?? 100}%
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Answer Review */}
      <Card>
        <CardHeader>
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setShowAnswers(!showAnswers)}
          >
            <CardTitle>Answer Review</CardTitle>
            {showAnswers ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </CardHeader>
        {showAnswers && (
          <CardContent className="space-y-4">
            {answers.map((a, idx) => (
              <div
                key={a.questionId}
                className={`rounded-lg border p-4 space-y-2 ${
                  a.correct ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium">
                    {idx + 1}. {a.question.text}
                  </p>
                  {a.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 ml-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 ml-2" />
                  )}
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className={a.correct ? "text-green-700" : "text-red-700"}>
                      {formatAnswer(a.userAnswer)}
                    </span>
                  </p>
                  {!a.correct && (
                    <p>
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span className="text-green-700">
                        {formatAnswer(JSON.stringify(a.question.correctAnswers))}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function formatAnswer(raw: string | null | undefined): string {
  if (!raw || raw === "null") return "Not answered";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
    return String(parsed);
  } catch {
    return raw;
  }
}
