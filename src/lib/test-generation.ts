import { prisma } from "@/lib/prisma";
import type { TestType } from "@/generated/prisma/client";

interface GenerateTestOptions {
  testTemplateId: number;
  name: string;
  description?: string | null;
  type: TestType;
  totalTime?: number | null;
  hseGroupId?: string | null;
  createdById: number;
}

interface GenerateRetakeOptions {
  parentTestId: number;
  failedCompetenceIds: string[];
  createdById: number;
}

/**
 * Randomly shuffle an array (Fisher-Yates).
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Select questions for a competence respecting level distribution.
 *
 * If `equalDistribution` is true, questions are evenly distributed across
 * available difficulty levels. Otherwise, questions are selected randomly
 * from all available questions regardless of level.
 */
async function selectQuestionsForCompetence(
  competenceId: string,
  numberOfQuestions: number,
  equalDistribution: boolean,
  excludeQuestionIds: number[] = []
): Promise<number[]> {
  const allQuestions = await prisma.question.findMany({
    where: {
      competenceId,
      ...(excludeQuestionIds.length > 0 && { id: { notIn: excludeQuestionIds } }),
    },
    select: { id: true, level: true },
  });

  if (allQuestions.length < numberOfQuestions) {
    throw new Error(
      `Insufficient questions for competence ${competenceId}: need ${numberOfQuestions}, have ${allQuestions.length}`
    );
  }

  if (!equalDistribution) {
    return shuffle(allQuestions).slice(0, numberOfQuestions).map((q) => q.id);
  }

  // Group by level
  const byLevel = new Map<number, number[]>();
  for (const q of allQuestions) {
    const list = byLevel.get(q.level) ?? [];
    list.push(q.id);
    byLevel.set(q.level, list);
  }

  const levels = [...byLevel.keys()].sort((a, b) => a - b);
  const selected: number[] = [];
  let remaining = numberOfQuestions;

  // Distribute evenly across levels
  const perLevel = Math.floor(numberOfQuestions / levels.length);
  let extra = numberOfQuestions % levels.length;

  for (const level of levels) {
    const pool = shuffle(byLevel.get(level)!);
    const take = Math.min(pool.length, perLevel + (extra > 0 ? 1 : 0));
    if (extra > 0 && take > perLevel) extra--;
    selected.push(...pool.slice(0, take));
    remaining -= take;
  }

  // If we still need more (some levels had fewer questions), fill from remaining
  if (remaining > 0) {
    const usedSet = new Set(selected);
    const leftovers = shuffle(allQuestions.filter((q) => !usedSet.has(q.id)));
    selected.push(...leftovers.slice(0, remaining).map((q) => q.id));
  }

  return selected;
}

/**
 * Generate a test from a template. Randomly selects questions per competence
 * respecting the configured level distribution (CompetenceEquality).
 */
export async function generateTest(options: GenerateTestOptions) {
  const template = await prisma.testTemplate.findUnique({
    where: { id: options.testTemplateId },
    include: {
      competences: true,
      competenceEqualities: true,
    },
  });

  if (!template) {
    throw new Error("Test template not found");
  }

  if (template.competences.length === 0) {
    throw new Error("Test template has no competences configured");
  }

  // Build equality lookup
  const equalityMap = new Map<string, boolean>();
  for (const eq of template.competenceEqualities) {
    if (eq.competenceId) {
      equalityMap.set(eq.competenceId, eq.isNumOfQuestionPerLevelEqual);
    }
  }

  // Select questions for each competence
  const allSelectedQuestionIds: number[] = [];

  for (const tc of template.competences) {
    const equalDist = equalityMap.get(tc.competenceId) ?? false;
    const questionIds = await selectQuestionsForCompetence(
      tc.competenceId,
      tc.numberOfQuestions,
      equalDist
    );
    allSelectedQuestionIds.push(...questionIds);
  }

  // Create test and link questions in a transaction
  const test = await prisma.$transaction(async (tx) => {
    const newTest = await tx.test.create({
      data: {
        name: options.name,
        description: options.description ?? null,
        type: options.type,
        totalTime: options.totalTime ?? null,
        hseGroupId: options.hseGroupId ?? null,
        testTemplateId: options.testTemplateId,
        createdById: options.createdById,
        iteration: 0,
      },
    });

    await tx.testQuestion.createMany({
      data: allSelectedQuestionIds.map((questionId) => ({
        testId: newTest.id,
        questionId,
      })),
    });

    return newTest;
  });

  return test;
}

/**
 * Generate a retake test for failed competencies. Uses new random questions,
 * excluding questions from the parent test.
 */
export async function generateRetakeTest(options: GenerateRetakeOptions) {
  const parentTest = await prisma.test.findUnique({
    where: { id: options.parentTestId },
    include: {
      questions: { select: { questionId: true } },
      testTemplate: {
        include: {
          competences: true,
          competenceEqualities: true,
        },
      },
    },
  });

  if (!parentTest) {
    throw new Error("Parent test not found");
  }

  if (!parentTest.testTemplate) {
    throw new Error("Parent test has no template — cannot generate retake");
  }

  const parentQuestionIds = parentTest.questions.map((q) => q.questionId);

  // Build equality lookup
  const equalityMap = new Map<string, boolean>();
  for (const eq of parentTest.testTemplate.competenceEqualities) {
    if (eq.competenceId) {
      equalityMap.set(eq.competenceId, eq.isNumOfQuestionPerLevelEqual);
    }
  }

  // Only include failed competences
  const failedSet = new Set(options.failedCompetenceIds);
  const relevantCompetences = parentTest.testTemplate.competences.filter(
    (tc) => failedSet.has(tc.competenceId)
  );

  if (relevantCompetences.length === 0) {
    throw new Error("No matching competences found for retake");
  }

  const allSelectedQuestionIds: number[] = [];

  for (const tc of relevantCompetences) {
    const equalDist = equalityMap.get(tc.competenceId) ?? false;
    const questionIds = await selectQuestionsForCompetence(
      tc.competenceId,
      tc.numberOfQuestions,
      equalDist,
      parentQuestionIds
    );
    allSelectedQuestionIds.push(...questionIds);
  }

  const retakeTest = await prisma.$transaction(async (tx) => {
    const newTest = await tx.test.create({
      data: {
        name: `${parentTest.name} (Retake ${parentTest.iteration + 1})`,
        description: parentTest.description,
        type: parentTest.type,
        totalTime: parentTest.totalTime,
        hseGroupId: parentTest.hseGroupId,
        testTemplateId: parentTest.testTemplateId,
        createdById: options.createdById,
        parentTestId: parentTest.id,
        iteration: parentTest.iteration + 1,
      },
    });

    await tx.testQuestion.createMany({
      data: allSelectedQuestionIds.map((questionId) => ({
        testId: newTest.id,
        questionId,
      })),
    });

    return newTest;
  });

  return retakeTest;
}
