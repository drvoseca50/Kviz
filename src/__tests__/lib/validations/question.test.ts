import {
  createQuestionSchema,
  updateQuestionSchema,
} from "@/lib/validations/question";

describe("createQuestionSchema", () => {
  const valid = {
    text: "What is the correct procedure for fire evacuation?",
    level: 1,
    questionType: "SINGLE_CHOICE" as const,
    possibleAnswers: ["Run", "Walk calmly to exit", "Hide"],
    correctAnswers: ["Walk calmly to exit"],
    competenceId: "comp_123",
  };

  it("should accept valid single choice question", () => {
    expect(createQuestionSchema.safeParse(valid).success).toBe(true);
  });

  it("should accept valid multiple choice question", () => {
    const result = createQuestionSchema.safeParse({
      ...valid,
      questionType: "MULTIPLE_CHOICE",
      correctAnswers: ["Walk calmly to exit", "Run"],
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid ordering question", () => {
    const result = createQuestionSchema.safeParse({
      ...valid,
      questionType: "ORDERING",
      correctAnswers: [0, 1, 2],
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid image placement question", () => {
    const result = createQuestionSchema.safeParse({
      ...valid,
      questionType: "IMAGE_PLACEMENT",
      imagePath: "/uploads/diagram.png",
    });
    expect(result.success).toBe(true);
  });

  it("should accept with optional answerTime", () => {
    const result = createQuestionSchema.safeParse({
      ...valid,
      answerTime: 60,
    });
    expect(result.success).toBe(true);
  });

  it("should accept null answerTime", () => {
    const result = createQuestionSchema.safeParse({
      ...valid,
      answerTime: null,
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing text", () => {
    const { text: _, ...noText } = valid;
    expect(createQuestionSchema.safeParse(noText).success).toBe(false);
  });

  it("should reject empty text", () => {
    expect(createQuestionSchema.safeParse({ ...valid, text: "" }).success).toBe(false);
  });

  it("should reject level below 1", () => {
    expect(createQuestionSchema.safeParse({ ...valid, level: 0 }).success).toBe(false);
  });

  it("should reject non-integer level", () => {
    expect(createQuestionSchema.safeParse({ ...valid, level: 1.5 }).success).toBe(false);
  });

  it("should reject invalid question type", () => {
    expect(createQuestionSchema.safeParse({ ...valid, questionType: "ESSAY" }).success).toBe(false);
  });

  it("should reject empty possibleAnswers", () => {
    expect(createQuestionSchema.safeParse({ ...valid, possibleAnswers: [] }).success).toBe(false);
  });

  it("should reject empty correctAnswers", () => {
    expect(createQuestionSchema.safeParse({ ...valid, correctAnswers: [] }).success).toBe(false);
  });

  it("should reject missing competenceId", () => {
    const { competenceId: _, ...noComp } = valid;
    expect(createQuestionSchema.safeParse(noComp).success).toBe(false);
  });

  it("should reject empty competenceId", () => {
    expect(createQuestionSchema.safeParse({ ...valid, competenceId: "" }).success).toBe(false);
  });

  it("should reject negative answerTime", () => {
    expect(createQuestionSchema.safeParse({ ...valid, answerTime: -10 }).success).toBe(false);
  });
});

describe("updateQuestionSchema", () => {
  it("should accept partial update", () => {
    expect(updateQuestionSchema.safeParse({ text: "Updated question?" }).success).toBe(true);
  });

  it("should accept empty object", () => {
    expect(updateQuestionSchema.safeParse({}).success).toBe(true);
  });

  it("should accept level update", () => {
    expect(updateQuestionSchema.safeParse({ level: 3 }).success).toBe(true);
  });

  it("should accept question type change", () => {
    expect(updateQuestionSchema.safeParse({ questionType: "ORDERING" }).success).toBe(true);
  });

  it("should reject empty text", () => {
    expect(updateQuestionSchema.safeParse({ text: "" }).success).toBe(false);
  });

  it("should reject invalid question type", () => {
    expect(updateQuestionSchema.safeParse({ questionType: "FILL_IN" }).success).toBe(false);
  });
});
