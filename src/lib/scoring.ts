import type { QuestionType } from "@/generated/prisma/client";

interface QuestionData {
  id: number;
  questionType: QuestionType;
  correctAnswers: unknown; // JSON field
  competenceId: string;
}

interface UserAnswer {
  questionId: number;
  answer: unknown; // JSON — string | string[] | number[]
}

interface ScoredAnswer {
  questionId: number;
  answer: string; // JSON-stringified
  correct: boolean;
  competenceId: string;
}

interface CompetenceScore {
  competenceId: string;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  passed: boolean;
}

export interface ScoringResult {
  answers: ScoredAnswer[];
  competenceScores: CompetenceScore[];
  overallPercentage: number;
  overallPassed: boolean;
  failedCompetenceIds: string[];
}

/**
 * Check if a single answer is correct for a given question type.
 */
function isAnswerCorrect(
  questionType: QuestionType,
  correctAnswers: unknown,
  userAnswer: unknown
): boolean {
  if (userAnswer == null) return false;

  const correct = correctAnswers as (string | number)[];

  switch (questionType) {
    case "SINGLE_CHOICE": {
      // correctAnswers: ["Answer text"], userAnswer: "Answer text"
      if (typeof userAnswer === "string") {
        return correct.length > 0 && userAnswer === String(correct[0]);
      }
      return false;
    }

    case "MULTIPLE_CHOICE": {
      // correctAnswers: ["A", "B"], userAnswer: ["A", "B"] — all-or-nothing
      if (!Array.isArray(userAnswer)) return false;
      const correctSet = new Set(correct.map(String));
      const userSet = new Set((userAnswer as string[]).map(String));
      if (correctSet.size !== userSet.size) return false;
      for (const c of correctSet) {
        if (!userSet.has(c)) return false;
      }
      return true;
    }

    case "ORDERING": {
      // correctAnswers: [0, 1, 2], userAnswer: [0, 1, 2] — exact sequence match
      if (!Array.isArray(userAnswer)) return false;
      const correctArr = correct.map(Number);
      const userArr = (userAnswer as number[]).map(Number);
      if (correctArr.length !== userArr.length) return false;
      return correctArr.every((val, idx) => val === userArr[idx]);
    }

    case "IMAGE_PLACEMENT": {
      // correctAnswers: ["A", "B", "C"], userAnswer: ["A", "B", "C"] — exact match
      if (!Array.isArray(userAnswer)) return false;
      const correctPlacement = correct.map(String);
      const userPlacement = (userAnswer as string[]).map(String);
      if (correctPlacement.length !== userPlacement.length) return false;
      return correctPlacement.every((val, idx) => val === userPlacement[idx]);
    }

    default:
      return false;
  }
}

/**
 * Score a complete test submission.
 *
 * @param questions - The questions in the test with their correct answers
 * @param userAnswers - The user's answers
 * @param passingIndicators - Map of competenceId → passing percentage (default 100)
 */
export function scoreTest(
  questions: QuestionData[],
  userAnswers: UserAnswer[],
  passingIndicators: Map<string, number>
): ScoringResult {
  const answerMap = new Map<number, unknown>();
  for (const ua of userAnswers) {
    answerMap.set(ua.questionId, ua.answer);
  }

  const scoredAnswers: ScoredAnswer[] = [];
  const competenceStats = new Map<
    string,
    { total: number; correct: number }
  >();

  for (const q of questions) {
    const userAnswer = answerMap.get(q.id);
    const correct = isAnswerCorrect(q.questionType, q.correctAnswers, userAnswer);

    scoredAnswers.push({
      questionId: q.id,
      answer: JSON.stringify(userAnswer ?? null),
      correct,
      competenceId: q.competenceId,
    });

    const stats = competenceStats.get(q.competenceId) ?? { total: 0, correct: 0 };
    stats.total++;
    if (correct) stats.correct++;
    competenceStats.set(q.competenceId, stats);
  }

  const competenceScores: CompetenceScore[] = [];
  const failedCompetenceIds: string[] = [];

  for (const [competenceId, stats] of competenceStats) {
    const percentage = stats.total > 0
      ? Math.round((stats.correct / stats.total) * 100)
      : 0;
    const passingThreshold = passingIndicators.get(competenceId) ?? 100;
    const passed = percentage >= passingThreshold;

    competenceScores.push({
      competenceId,
      totalQuestions: stats.total,
      correctCount: stats.correct,
      percentage,
      passed,
    });

    if (!passed) {
      failedCompetenceIds.push(competenceId);
    }
  }

  const totalCorrect = scoredAnswers.filter((a) => a.correct).length;
  const overallPercentage = questions.length > 0
    ? Math.round((totalCorrect / questions.length) * 100)
    : 0;

  return {
    answers: scoredAnswers,
    competenceScores,
    overallPercentage,
    overallPassed: failedCompetenceIds.length === 0,
    failedCompetenceIds,
  };
}
