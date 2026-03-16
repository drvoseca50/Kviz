"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, AlertTriangle, Play } from "lucide-react";

interface TestInfo {
  id: number;
  name: string;
  description: string | null;
  type: string;
  totalTime: number | null;
  iteration: number;
  questions: { id: number }[];
}

export default function PreTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<TestInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tests/${testId}/take`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load test");
          return;
        }
        setTest(data);
      })
      .catch(() => setError("Failed to load test"))
      .finally(() => setLoading(false));
  }, [testId]);

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
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-lg font-medium text-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.push("/user/tests")}>
          Back to My Tests
        </Button>
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => router.push("/user/tests")}>
        &larr; Back to My Tests
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{test.name}</CardTitle>
            <Badge variant="secondary">{test.type}</Badge>
          </div>
          {test.description && (
            <p className="text-muted-foreground">{test.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold">{test.questions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Time Limit</p>
                <p className="text-2xl font-bold">
                  {test.totalTime ? `${test.totalTime} min` : "No limit"}
                </p>
              </div>
            </div>
          </div>

          {test.iteration > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                This is retake attempt #{test.iteration}. Only failed competencies are included.
              </p>
            </div>
          )}

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h3 className="font-semibold">Instructions</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Read each question carefully before answering</li>
              <li>You can navigate between questions using the Previous/Next buttons</li>
              <li>You can review and change your answers before submitting</li>
              {test.totalTime && (
                <li>The test will auto-submit when the timer runs out</li>
              )}
              <li>Once submitted, you cannot retake this test</li>
              <li>Your results will be shown immediately after submission</li>
            </ul>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push(`/user/tests/${testId}/take`)}
          >
            <Play className="mr-2 h-5 w-5" />
            Begin Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
