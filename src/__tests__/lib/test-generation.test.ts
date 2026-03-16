// Mock prisma before importing
jest.mock("@/lib/prisma", () => ({
  prisma: {
    question: { findMany: jest.fn() },
    testTemplate: { findUnique: jest.fn() },
    test: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    testQuestion: { createMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { generateTest, generateRetakeTest } from "@/lib/test-generation";

const mockPrisma = prisma as unknown as {
  question: { findMany: jest.Mock };
  testTemplate: { findUnique: jest.Mock };
  test: { findUnique: jest.Mock; create: jest.Mock };
  testQuestion: { createMany: jest.Mock };
  $transaction: jest.Mock;
};

describe("generateTest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default $transaction: just execute the callback with prisma as tx
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
      return cb(prisma);
    });
  });

  const baseOptions = {
    testTemplateId: 1,
    name: "Test 1",
    type: "HSE" as const,
    createdById: 1,
  };

  it("should throw if template not found", async () => {
    mockPrisma.testTemplate.findUnique.mockResolvedValue(null);

    await expect(generateTest(baseOptions)).rejects.toThrow("Test template not found");
  });

  it("should throw if template has no competences", async () => {
    mockPrisma.testTemplate.findUnique.mockResolvedValue({
      id: 1,
      name: "Template",
      competences: [],
      competenceEqualities: [],
    });

    await expect(generateTest(baseOptions)).rejects.toThrow("Test template has no competences configured");
  });

  it("should throw if insufficient questions for a competence", async () => {
    mockPrisma.testTemplate.findUnique.mockResolvedValue({
      id: 1,
      name: "Template",
      competences: [
        { competenceId: "comp_1", numberOfQuestions: 10 },
      ],
      competenceEqualities: [],
    });

    // Only 3 questions available but need 10
    mockPrisma.question.findMany.mockResolvedValue([
      { id: 1, level: 1 },
      { id: 2, level: 2 },
      { id: 3, level: 3 },
    ]);

    await expect(generateTest(baseOptions)).rejects.toThrow(/Insufficient questions/);
  });

  it("should select correct number of questions per competence", async () => {
    mockPrisma.testTemplate.findUnique.mockResolvedValue({
      id: 1,
      name: "Template",
      competences: [
        { competenceId: "comp_1", numberOfQuestions: 3 },
        { competenceId: "comp_2", numberOfQuestions: 2 },
      ],
      competenceEqualities: [],
    });

    // comp_1 has 5 questions
    mockPrisma.question.findMany
      .mockResolvedValueOnce([
        { id: 1, level: 1 },
        { id: 2, level: 1 },
        { id: 3, level: 2 },
        { id: 4, level: 2 },
        { id: 5, level: 3 },
      ])
      // comp_2 has 4 questions
      .mockResolvedValueOnce([
        { id: 10, level: 1 },
        { id: 11, level: 1 },
        { id: 12, level: 2 },
        { id: 13, level: 2 },
      ]);

    const mockCreatedTest = { id: 100, name: "Test 1" };
    mockPrisma.test.create.mockResolvedValue(mockCreatedTest);
    mockPrisma.testQuestion.createMany.mockResolvedValue({ count: 5 });

    const result = await generateTest(baseOptions);

    expect(result).toEqual(mockCreatedTest);

    // Verify test was created
    expect(mockPrisma.test.create).toHaveBeenCalledTimes(1);
    const createCall = mockPrisma.test.create.mock.calls[0][0];
    expect(createCall.data.name).toBe("Test 1");
    expect(createCall.data.type).toBe("HSE");
    expect(createCall.data.testTemplateId).toBe(1);
    expect(createCall.data.iteration).toBe(0);

    // Verify questions were linked - should be 3 + 2 = 5 total
    expect(mockPrisma.testQuestion.createMany).toHaveBeenCalledTimes(1);
    const questionData = mockPrisma.testQuestion.createMany.mock.calls[0][0].data;
    expect(questionData).toHaveLength(5);

    // Verify all question IDs are from the valid pools
    const validIds = new Set([1, 2, 3, 4, 5, 10, 11, 12, 13]);
    for (const q of questionData) {
      expect(validIds.has(q.questionId)).toBe(true);
      expect(q.testId).toBe(100);
    }

    // Verify no duplicate question IDs
    const selectedIds = questionData.map((q: { questionId: number }) => q.questionId);
    expect(new Set(selectedIds).size).toBe(5);
  });

  it("should pass optional fields through to test creation", async () => {
    mockPrisma.testTemplate.findUnique.mockResolvedValue({
      id: 1,
      name: "Template",
      competences: [{ competenceId: "comp_1", numberOfQuestions: 1 }],
      competenceEqualities: [],
    });

    mockPrisma.question.findMany.mockResolvedValue([{ id: 1, level: 1 }]);
    mockPrisma.test.create.mockResolvedValue({ id: 1 });
    mockPrisma.testQuestion.createMany.mockResolvedValue({ count: 1 });

    await generateTest({
      ...baseOptions,
      description: "A test",
      totalTime: 60,
      hseGroupId: "hse_001",
    });

    const createCall = mockPrisma.test.create.mock.calls[0][0];
    expect(createCall.data.description).toBe("A test");
    expect(createCall.data.totalTime).toBe(60);
    expect(createCall.data.hseGroupId).toBe("hse_001");
  });
});

describe("generateRetakeTest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
      return cb(prisma);
    });
  });

  it("should throw if parent test not found", async () => {
    mockPrisma.test.findUnique.mockResolvedValue(null);

    await expect(
      generateRetakeTest({ parentTestId: 1, failedCompetenceIds: ["c1"], createdById: 1 })
    ).rejects.toThrow("Parent test not found");
  });

  it("should throw if parent test has no template", async () => {
    mockPrisma.test.findUnique.mockResolvedValue({
      id: 1,
      questions: [],
      testTemplate: null,
    });

    await expect(
      generateRetakeTest({ parentTestId: 1, failedCompetenceIds: ["c1"], createdById: 1 })
    ).rejects.toThrow("Parent test has no template");
  });

  it("should throw if no matching competences for retake", async () => {
    mockPrisma.test.findUnique.mockResolvedValue({
      id: 1,
      name: "Original",
      iteration: 0,
      questions: [{ questionId: 1 }],
      testTemplate: {
        competences: [{ competenceId: "comp_1", numberOfQuestions: 2 }],
        competenceEqualities: [],
      },
    });

    await expect(
      generateRetakeTest({ parentTestId: 1, failedCompetenceIds: ["comp_nonexistent"], createdById: 1 })
    ).rejects.toThrow("No matching competences found for retake");
  });

  it("should increment iteration and set parentTestId", async () => {
    mockPrisma.test.findUnique.mockResolvedValue({
      id: 1,
      name: "Original Test",
      description: "Desc",
      type: "HSE",
      totalTime: 30,
      hseGroupId: "hse_1",
      testTemplateId: 1,
      iteration: 0,
      questions: [{ questionId: 100 }],
      testTemplate: {
        competences: [{ competenceId: "comp_1", numberOfQuestions: 2 }],
        competenceEqualities: [],
      },
    });

    // Available questions (excluding parent's question 100)
    mockPrisma.question.findMany.mockResolvedValue([
      { id: 200, level: 1 },
      { id: 201, level: 2 },
      { id: 202, level: 3 },
    ]);

    const mockRetake = { id: 2, name: "Original Test (Retake 1)" };
    mockPrisma.test.create.mockResolvedValue(mockRetake);
    mockPrisma.testQuestion.createMany.mockResolvedValue({ count: 2 });

    const result = await generateRetakeTest({
      parentTestId: 1,
      failedCompetenceIds: ["comp_1"],
      createdById: 1,
    });

    expect(result).toEqual(mockRetake);

    const createCall = mockPrisma.test.create.mock.calls[0][0];
    expect(createCall.data.parentTestId).toBe(1);
    expect(createCall.data.iteration).toBe(1);
    expect(createCall.data.name).toContain("Retake 1");

    // Verify excluded parent questions
    const findManyCall = mockPrisma.question.findMany.mock.calls[0][0];
    expect(findManyCall.where.id.notIn).toContain(100);
  });

  it("should only include failed competences in retake", async () => {
    mockPrisma.test.findUnique.mockResolvedValue({
      id: 1,
      name: "Original",
      description: null,
      type: "TECHNICAL",
      totalTime: null,
      hseGroupId: null,
      testTemplateId: 1,
      iteration: 0,
      questions: [],
      testTemplate: {
        competences: [
          { competenceId: "comp_pass", numberOfQuestions: 3 },
          { competenceId: "comp_fail", numberOfQuestions: 2 },
        ],
        competenceEqualities: [],
      },
    });

    mockPrisma.question.findMany.mockResolvedValue([
      { id: 1, level: 1 },
      { id: 2, level: 2 },
    ]);

    mockPrisma.test.create.mockResolvedValue({ id: 2 });
    mockPrisma.testQuestion.createMany.mockResolvedValue({ count: 2 });

    await generateRetakeTest({
      parentTestId: 1,
      failedCompetenceIds: ["comp_fail"],
      createdById: 1,
    });

    // Should only query questions for failed competence
    expect(mockPrisma.question.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.question.findMany.mock.calls[0][0].where.competenceId).toBe("comp_fail");

    // Only 2 questions (from comp_fail), not 5
    const questionData = mockPrisma.testQuestion.createMany.mock.calls[0][0].data;
    expect(questionData).toHaveLength(2);
  });
});
