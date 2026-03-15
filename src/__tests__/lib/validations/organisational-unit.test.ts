import {
  createOrgUnitSchema,
  updateOrgUnitSchema,
} from "@/lib/validations/organisational-unit";

describe("createOrgUnitSchema", () => {
  it("should accept valid org unit", () => {
    const result = createOrgUnitSchema.safeParse({ name: "Headquarters" });
    expect(result.success).toBe(true);
  });

  it("should accept org unit with superiorId", () => {
    const result = createOrgUnitSchema.safeParse({
      name: "IT Department",
      superiorId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("should accept null superiorId", () => {
    const result = createOrgUnitSchema.safeParse({
      name: "Top Level",
      superiorId: null,
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = createOrgUnitSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing name", () => {
    const result = createOrgUnitSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject non-positive superiorId", () => {
    const result = createOrgUnitSchema.safeParse({ name: "Unit", superiorId: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer superiorId", () => {
    const result = createOrgUnitSchema.safeParse({ name: "Unit", superiorId: 1.5 });
    expect(result.success).toBe(false);
  });

  it("should reject name longer than 200 chars", () => {
    const result = createOrgUnitSchema.safeParse({ name: "X".repeat(201) });
    expect(result.success).toBe(false);
  });
});

describe("updateOrgUnitSchema", () => {
  it("should accept partial update", () => {
    const result = updateOrgUnitSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("should accept empty object", () => {
    const result = updateOrgUnitSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept updating superiorId to null", () => {
    const result = updateOrgUnitSchema.safeParse({ superiorId: null });
    expect(result.success).toBe(true);
  });

  it("should reject empty name string", () => {
    const result = updateOrgUnitSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});
