"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, Play, Eye } from "lucide-react";

interface TestItem {
  testId: number;
  name: string;
  description: string | null;
  type: string;
  totalTime: number | null;
  questionCount: number;
  templateName: string | null;
  createdAt: string;
  iteration: number;
  status: "PENDING" | "COMPLETED" | "PASSED" | "FAILED";
  result: {
    id: number;
    passed: boolean;
    percentage: number;
    dateTime: string;
  } | null;
}

export default function UserTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/my-tests")
      .then((res) => res.json())
      .then(setTests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingTests = tests.filter((t) => t.status === "PENDING");
  const completedTests = tests.filter((t) => t.status !== "PENDING");

  function statusBadge(status: string) {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case "PASSED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Passed</Badge>;
      case "FAILED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">My Tests</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Tests</h1>
        <p className="mt-1 text-muted-foreground">View and take your assigned tests</p>
      </div>

      {/* Pending Tests */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Pending Tests ({pendingTests.length})
        </h2>
        {pendingTests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending tests. You&apos;re all caught up!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingTests.map((test) => (
              <Card key={test.testId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{test.name}</CardTitle>
                    {statusBadge(test.status)}
                  </div>
                  {test.description && (
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {test.questionCount} questions
                    </span>
                    {test.totalTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {test.totalTime} min
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">{test.type}</Badge>
                    {test.iteration > 0 && (
                      <Badge variant="outline" className="text-xs">Retake {test.iteration}</Badge>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/user/tests/${test.testId}`)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Tests */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Completed Tests ({completedTests.length})
        </h2>
        {completedTests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No completed tests yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedTests.map((test) => (
              <Card key={test.testId}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{test.name}</CardTitle>
                    {statusBadge(test.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {test.questionCount} questions
                    </span>
                    {test.result && (
                      <span className="font-medium text-foreground">
                        {test.result.percentage}%
                      </span>
                    )}
                  </div>
                  {test.result && (
                    <p className="text-xs text-muted-foreground">
                      Completed: {new Date(test.result.dateTime).toLocaleDateString()}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/user/tests/${test.testId}/results`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Results
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
