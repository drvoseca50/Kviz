import {
  createPositionSchema,
  updatePositionSchema,
} from "@/lib/validations/position";

describe("createPositionSchema", () => {
  it("should accept valid position", () => {
    const result = createPositionSchema.safeParse({ name: "Engineer" });
    expect(result.success).toBe(true);
  });

  it("should accept position with hseGroupId", () => {
    const result = createPositionSchema.safeParse({
      name: "Technician",
      hseGroupId: "HSE_1",
    });
    expect(result.success).toBe(true);
  });

  it("should accept null hseGroupId", () => {
    const result = createPositionSchema.safeParse({
      name: "Manager",
      hseGroupId: null,
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = createPositionSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing name", () => {
    const result = createPositionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject name longer than 200 chars", () => {
    const result = createPositionSchema.safeParse({ name: "A".repeat(201) });
    expect(result.success).toBe(false);
  });
});

describe("updatePositionSchema", () => {
  it("should accept partial update", () => {
    const result = updatePositionSchema.safeParse({ name: "Senior Engineer" });
    expect(result.success).toBe(true);
  });

  it("should accept empty object", () => {
    const result = updatePositionSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject empty name string", () => {
    const result = updatePositionSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});
