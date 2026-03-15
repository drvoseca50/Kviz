import {
  createHseGroupSchema,
  updateHseGroupSchema,
} from "@/lib/validations/hse-group";

describe("createHseGroupSchema", () => {
  const validGroup = {
    id: "HSE_001",
    name: "Safety Group A",
    program: "HSE_PROGRAM_1",
  };

  it("should accept valid HSE group", () => {
    const result = createHseGroupSchema.safeParse(validGroup);
    expect(result.success).toBe(true);
  });

  it("should accept with optional numeric fields", () => {
    const result = createHseGroupSchema.safeParse({
      ...validGroup,
      riskPriority: 5,
      minQuestionCountHse: 10,
      totalQuestionCountHse: 20,
    });
    expect(result.success).toBe(true);
  });

  it("should accept null for optional numeric fields", () => {
    const result = createHseGroupSchema.safeParse({
      ...validGroup,
      riskPriority: null,
      minQuestionCountHse: null,
      totalQuestionCountHse: null,
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty id", () => {
    const result = createHseGroupSchema.safeParse({ ...validGroup, id: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty name", () => {
    const result = createHseGroupSchema.safeParse({ ...validGroup, name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty program", () => {
    const result = createHseGroupSchema.safeParse({ ...validGroup, program: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing required fields", () => {
    const result = createHseGroupSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject non-integer riskPriority", () => {
    const result = createHseGroupSchema.safeParse({ ...validGroup, riskPriority: 1.5 });
    expect(result.success).toBe(false);
  });
});

describe("updateHseGroupSchema", () => {
  it("should accept partial update", () => {
    const result = updateHseGroupSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("should accept empty object", () => {
    const result = updateHseGroupSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject empty name string", () => {
    const result = updateHseGroupSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty program string", () => {
    const result = updateHseGroupSchema.safeParse({ program: "" });
    expect(result.success).toBe(false);
  });
});
