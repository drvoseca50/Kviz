import {
  createClusterSchema,
  updateClusterSchema,
  createFamilySchema,
  updateFamilySchema,
  createGroupSchema,
  updateGroupSchema,
  createCompetenceSchema,
  updateCompetenceSchema,
} from "@/lib/validations/competence";

// ─── Cluster ─────────────────────────────────────────────────────────────────

describe("createClusterSchema", () => {
  it("should accept valid cluster", () => {
    expect(createClusterSchema.safeParse({ name: "Technical Skills" }).success).toBe(true);
  });

  it("should accept with type", () => {
    expect(createClusterSchema.safeParse({ name: "Safety", type: "HSE" }).success).toBe(true);
  });

  it("should accept null type", () => {
    expect(createClusterSchema.safeParse({ name: "General", type: null }).success).toBe(true);
  });

  it("should reject empty name", () => {
    expect(createClusterSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("should reject missing name", () => {
    expect(createClusterSchema.safeParse({}).success).toBe(false);
  });

  it("should reject invalid type", () => {
    expect(createClusterSchema.safeParse({ name: "X", type: "INVALID" }).success).toBe(false);
  });
});

describe("updateClusterSchema", () => {
  it("should accept partial update", () => {
    expect(updateClusterSchema.safeParse({ name: "Updated" }).success).toBe(true);
  });

  it("should accept empty object", () => {
    expect(updateClusterSchema.safeParse({}).success).toBe(true);
  });

  it("should reject empty name", () => {
    expect(updateClusterSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

// ─── Family ──────────────────────────────────────────────────────────────────

describe("createFamilySchema", () => {
  const valid = { name: "Electrical Safety", clusterId: 1 };

  it("should accept valid family", () => {
    expect(createFamilySchema.safeParse(valid).success).toBe(true);
  });

  it("should accept with type", () => {
    expect(createFamilySchema.safeParse({ ...valid, type: "PROFESSIONAL" }).success).toBe(true);
  });

  it("should reject missing clusterId", () => {
    expect(createFamilySchema.safeParse({ name: "Test" }).success).toBe(false);
  });

  it("should reject zero clusterId", () => {
    expect(createFamilySchema.safeParse({ name: "Test", clusterId: 0 }).success).toBe(false);
  });

  it("should reject negative clusterId", () => {
    expect(createFamilySchema.safeParse({ name: "Test", clusterId: -1 }).success).toBe(false);
  });
});

describe("updateFamilySchema", () => {
  it("should accept partial update", () => {
    expect(updateFamilySchema.safeParse({ name: "Updated" }).success).toBe(true);
  });

  it("should accept empty object", () => {
    expect(updateFamilySchema.safeParse({}).success).toBe(true);
  });
});

// ─── Group ───────────────────────────────────────────────────────────────────

describe("createGroupSchema", () => {
  const valid = { name: "Fire Prevention", familyId: 1 };

  it("should accept valid group", () => {
    expect(createGroupSchema.safeParse(valid).success).toBe(true);
  });

  it("should reject missing familyId", () => {
    expect(createGroupSchema.safeParse({ name: "Test" }).success).toBe(false);
  });

  it("should reject non-integer familyId", () => {
    expect(createGroupSchema.safeParse({ name: "Test", familyId: 1.5 }).success).toBe(false);
  });
});

describe("updateGroupSchema", () => {
  it("should accept partial update", () => {
    expect(updateGroupSchema.safeParse({ type: "HSE" }).success).toBe(true);
  });

  it("should accept empty object", () => {
    expect(updateGroupSchema.safeParse({}).success).toBe(true);
  });
});

// ─── Competence ──────────────────────────────────────────────────────────────

describe("createCompetenceSchema", () => {
  const valid = {
    name: "Fire Extinguisher Usage",
    type: "HSE" as const,
    competenceGroupId: "grp_123",
  };

  it("should accept valid competence", () => {
    expect(createCompetenceSchema.safeParse(valid).success).toBe(true);
  });

  it("should accept with all optional fields", () => {
    const result = createCompetenceSchema.safeParse({
      ...valid,
      description: "How to use fire extinguishers",
      indicatorLevel: 3,
      indicatorName: "Level 3",
      passingIndicator: 80,
      responsibleManagerId: 5,
    });
    expect(result.success).toBe(true);
  });

  it("should accept null optional fields", () => {
    const result = createCompetenceSchema.safeParse({
      ...valid,
      description: null,
      indicatorLevel: null,
      passingIndicator: null,
      responsibleManagerId: null,
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing name", () => {
    expect(createCompetenceSchema.safeParse({ type: "HSE", competenceGroupId: "x" }).success).toBe(false);
  });

  it("should reject missing type", () => {
    expect(createCompetenceSchema.safeParse({ name: "Test", competenceGroupId: "x" }).success).toBe(false);
  });

  it("should reject invalid type", () => {
    expect(createCompetenceSchema.safeParse({ ...valid, type: "INVALID" }).success).toBe(false);
  });

  it("should reject missing competenceGroupId", () => {
    expect(createCompetenceSchema.safeParse({ name: "Test", type: "HSE" }).success).toBe(false);
  });

  it("should reject empty competenceGroupId", () => {
    expect(createCompetenceSchema.safeParse({ ...valid, competenceGroupId: "" }).success).toBe(false);
  });
});

describe("updateCompetenceSchema", () => {
  it("should accept partial update", () => {
    expect(updateCompetenceSchema.safeParse({ name: "Updated" }).success).toBe(true);
  });

  it("should accept empty object", () => {
    expect(updateCompetenceSchema.safeParse({}).success).toBe(true);
  });

  it("should accept type change", () => {
    expect(updateCompetenceSchema.safeParse({ type: "PROFESSIONAL" }).success).toBe(true);
  });

  it("should reject empty name", () => {
    expect(updateCompetenceSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("should reject invalid type", () => {
    expect(updateCompetenceSchema.safeParse({ type: "BAD" }).success).toBe(false);
  });
});
