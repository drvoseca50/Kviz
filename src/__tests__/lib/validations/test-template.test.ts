import {
  createTestTemplateSchema,
  updateTestTemplateSchema,
  setTemplateCompetencesSchema,
  setCompetenceEqualitySchema,
  generateTestSchema,
  assignTestSchema,
} from "@/lib/validations/test-template";

// ─── Test Template CRUD ──────────────────────────────────────────────────────

describe("createTestTemplateSchema", () => {
  it("should accept valid template", () => {
    expect(createTestTemplateSchema.safeParse({ name: "HSE Q1 2026" }).success).toBe(true);
  });

  it("should reject empty name", () => {
    expect(createTestTemplateSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("should reject missing name", () => {
    expect(createTestTemplateSchema.safeParse({}).success).toBe(false);
  });

  it("should reject name exceeding max length", () => {
    expect(createTestTemplateSchema.safeParse({ name: "x".repeat(501) }).success).toBe(false);
  });
});

describe("updateTestTemplateSchema", () => {
  it("should accept partial update", () => {
    expect(updateTestTemplateSchema.safeParse({ name: "Updated" }).success).toBe(true);
  });

  it("should accept empty object", () => {
    expect(updateTestTemplateSchema.safeParse({}).success).toBe(true);
  });

  it("should reject empty name", () => {
    expect(updateTestTemplateSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

// ─── Template Competences ────────────────────────────────────────────────────

describe("setTemplateCompetencesSchema", () => {
  it("should accept valid competences list", () => {
    const result = setTemplateCompetencesSchema.safeParse({
      competences: [
        { competenceId: "comp_1", numberOfQuestions: 5 },
        { competenceId: "comp_2", numberOfQuestions: 3 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty competences list", () => {
    expect(setTemplateCompetencesSchema.safeParse({ competences: [] }).success).toBe(true);
  });

  it("should reject numberOfQuestions less than 1", () => {
    const result = setTemplateCompetencesSchema.safeParse({
      competences: [{ competenceId: "comp_1", numberOfQuestions: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty competenceId", () => {
    const result = setTemplateCompetencesSchema.safeParse({
      competences: [{ competenceId: "", numberOfQuestions: 5 }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing competences field", () => {
    expect(setTemplateCompetencesSchema.safeParse({}).success).toBe(false);
  });

  it("should reject non-integer numberOfQuestions", () => {
    const result = setTemplateCompetencesSchema.safeParse({
      competences: [{ competenceId: "comp_1", numberOfQuestions: 2.5 }],
    });
    expect(result.success).toBe(false);
  });
});

// ─── Competence Equality ─────────────────────────────────────────────────────

describe("setCompetenceEqualitySchema", () => {
  it("should accept valid equalities", () => {
    const result = setCompetenceEqualitySchema.safeParse({
      equalities: [
        { competenceId: "comp_1", isNumOfQuestionPerLevelEqual: true },
        { competenceId: "comp_2", isNumOfQuestionPerLevelEqual: false },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty equalities list", () => {
    expect(setCompetenceEqualitySchema.safeParse({ equalities: [] }).success).toBe(true);
  });

  it("should reject missing isNumOfQuestionPerLevelEqual", () => {
    const result = setCompetenceEqualitySchema.safeParse({
      equalities: [{ competenceId: "comp_1" }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-boolean isNumOfQuestionPerLevelEqual", () => {
    const result = setCompetenceEqualitySchema.safeParse({
      equalities: [{ competenceId: "comp_1", isNumOfQuestionPerLevelEqual: "yes" }],
    });
    expect(result.success).toBe(false);
  });
});

// ─── Generate Test ───────────────────────────────────────────────────────────

describe("generateTestSchema", () => {
  const valid = {
    testTemplateId: 1,
    name: "HSE Assessment March 2026",
    type: "HSE" as const,
  };

  it("should accept valid generate request", () => {
    expect(generateTestSchema.safeParse(valid).success).toBe(true);
  });

  it("should accept with all optional fields", () => {
    const result = generateTestSchema.safeParse({
      ...valid,
      description: "Monthly safety check",
      totalTime: 60,
      hseGroupId: "hse_001",
    });
    expect(result.success).toBe(true);
  });

  it("should accept null optional fields", () => {
    const result = generateTestSchema.safeParse({
      ...valid,
      description: null,
      totalTime: null,
      hseGroupId: null,
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing testTemplateId", () => {
    const { testTemplateId: _, ...noId } = valid;
    expect(generateTestSchema.safeParse(noId).success).toBe(false);
  });

  it("should reject missing name", () => {
    const { name: _, ...noName } = valid;
    expect(generateTestSchema.safeParse(noName).success).toBe(false);
  });

  it("should reject empty name", () => {
    expect(generateTestSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("should reject missing type", () => {
    const { type: _, ...noType } = valid;
    expect(generateTestSchema.safeParse(noType).success).toBe(false);
  });

  it("should reject invalid type", () => {
    expect(generateTestSchema.safeParse({ ...valid, type: "QUIZ" }).success).toBe(false);
  });

  it("should accept TECHNICAL type", () => {
    expect(generateTestSchema.safeParse({ ...valid, type: "TECHNICAL" }).success).toBe(true);
  });

  it("should reject negative totalTime", () => {
    expect(generateTestSchema.safeParse({ ...valid, totalTime: -5 }).success).toBe(false);
  });

  it("should reject zero totalTime", () => {
    expect(generateTestSchema.safeParse({ ...valid, totalTime: 0 }).success).toBe(false);
  });
});

// ─── Assign Test ─────────────────────────────────────────────────────────────

describe("assignTestSchema", () => {
  it("should accept valid user IDs", () => {
    expect(assignTestSchema.safeParse({ userIds: [1, 2, 3] }).success).toBe(true);
  });

  it("should accept single user", () => {
    expect(assignTestSchema.safeParse({ userIds: [1] }).success).toBe(true);
  });

  it("should reject empty user list", () => {
    expect(assignTestSchema.safeParse({ userIds: [] }).success).toBe(false);
  });

  it("should reject missing userIds", () => {
    expect(assignTestSchema.safeParse({}).success).toBe(false);
  });

  it("should reject non-integer user IDs", () => {
    expect(assignTestSchema.safeParse({ userIds: [1.5] }).success).toBe(false);
  });
});
