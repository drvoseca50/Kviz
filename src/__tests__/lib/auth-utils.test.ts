import {
  validatePassword,
  hashPassword,
  verifyPassword,
  isPasswordChangeRequired,
  hasRole,
  hasAnyRole,
} from "@/lib/auth-utils";

describe("validatePassword", () => {
  it("should reject passwords shorter than 15 characters", () => {
    const result = validatePassword("Short@1Aa");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Password must be at least 15 characters long"
    );
  });

  it("should reject passwords without uppercase letters", () => {
    const result = validatePassword("nouppercase@12345");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one uppercase letter"
    );
  });

  it("should reject passwords without lowercase letters", () => {
    const result = validatePassword("NOLOWERCASE@12345");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one lowercase letter"
    );
  });

  it("should reject passwords without special characters", () => {
    const result = validatePassword("NoSpecialChar12345");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one special character"
    );
  });

  it("should accept valid passwords meeting all criteria", () => {
    const result = validatePassword("ValidPassword@123");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should return multiple errors for very weak passwords", () => {
    const result = validatePassword("short");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("hashPassword and verifyPassword", () => {
  it("should hash and verify a password correctly", async () => {
    const password = "TestPassword@123";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it("should reject incorrect passwords", async () => {
    const hash = await hashPassword("CorrectPassword@1");
    expect(await verifyPassword("WrongPassword@123", hash)).toBe(false);
  });

  it("should generate different hashes for the same password", async () => {
    const password = "SamePassword@1234";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
    expect(await verifyPassword(password, hash1)).toBe(true);
    expect(await verifyPassword(password, hash2)).toBe(true);
  });
});

describe("isPasswordChangeRequired", () => {
  it("should return true when passwordChangedAt is null", () => {
    expect(isPasswordChangeRequired(null)).toBe(true);
  });

  it("should return false when password was changed recently", () => {
    const now = new Date();
    expect(isPasswordChangeRequired(now)).toBe(false);
  });

  it("should return true when password was changed more than 3 days ago", () => {
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    expect(isPasswordChangeRequired(fourDaysAgo)).toBe(true);
  });

  it("should return false when password was changed exactly 2 days ago", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    expect(isPasswordChangeRequired(twoDaysAgo)).toBe(false);
  });
});

describe("hasRole", () => {
  it("should return true when user has the required role", () => {
    expect(hasRole(["ADMIN", "USER"], "ADMIN")).toBe(true);
  });

  it("should return false when user does not have the required role", () => {
    expect(hasRole(["USER"], "ADMIN")).toBe(false);
  });

  it("should return false for empty roles array", () => {
    expect(hasRole([], "ADMIN")).toBe(false);
  });
});

describe("hasAnyRole", () => {
  it("should return true when user has at least one required role", () => {
    expect(hasAnyRole(["MANAGER"], ["ADMIN", "MANAGER"])).toBe(true);
  });

  it("should return false when user has none of the required roles", () => {
    expect(hasAnyRole(["USER"], ["ADMIN", "MANAGER"])).toBe(false);
  });

  it("should return false for empty user roles", () => {
    expect(hasAnyRole([], ["ADMIN"])).toBe(false);
  });

  it("should return false for empty required roles", () => {
    expect(hasAnyRole(["ADMIN"], [])).toBe(false);
  });
});
