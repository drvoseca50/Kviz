import {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  changePasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/user";

describe("createUserSchema", () => {
  const validUser = {
    username: "john.doe",
    email: "john@example.com",
    password: "ValidPassword@123",
    lastNameFirstName: "Doe John",
    sapId: 12345,
    phone: "+1234567890",
    positionId: "ENGINEER",
    organisationalUnitId: 1,
  };

  it("should accept a valid user", () => {
    const result = createUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("should reject username shorter than 3 chars", () => {
    const result = createUserSchema.safeParse({ ...validUser, username: "ab" });
    expect(result.success).toBe(false);
  });

  it("should reject username with invalid characters", () => {
    const result = createUserSchema.safeParse({ ...validUser, username: "john doe!" });
    expect(result.success).toBe(false);
  });

  it("should reject weak password", () => {
    const result = createUserSchema.safeParse({ ...validUser, password: "short" });
    expect(result.success).toBe(false);
  });

  it("should reject password without uppercase", () => {
    const result = createUserSchema.safeParse({ ...validUser, password: "nouppercase@12345" });
    expect(result.success).toBe(false);
  });

  it("should reject password without special char", () => {
    const result = createUserSchema.safeParse({ ...validUser, password: "NoSpecialChar12345" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const result = createUserSchema.safeParse({ ...validUser, email: "notanemail" });
    expect(result.success).toBe(false);
  });

  it("should accept null email", () => {
    const result = createUserSchema.safeParse({ ...validUser, email: null });
    expect(result.success).toBe(true);
  });

  it("should reject negative sapId", () => {
    const result = createUserSchema.safeParse({ ...validUser, sapId: -1 });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer sapId", () => {
    const result = createUserSchema.safeParse({ ...validUser, sapId: 1.5 });
    expect(result.success).toBe(false);
  });

  it("should accept optional nullable fields as null", () => {
    const result = createUserSchema.safeParse({
      username: "test.user",
      password: "ValidPassword@123",
      sapId: 100,
      email: null,
      lastNameFirstName: null,
      phone: null,
      positionId: null,
      organisationalUnitId: null,
    });
    expect(result.success).toBe(true);
  });

  it("should accept without optional fields", () => {
    const result = createUserSchema.safeParse({
      username: "test.user",
      password: "ValidPassword@123",
      sapId: 100,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateUserSchema", () => {
  it("should accept partial updates", () => {
    const result = updateUserSchema.safeParse({ email: "new@example.com" });
    expect(result.success).toBe(true);
  });

  it("should accept empty object", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = updateUserSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });

  it("should accept null values for nullable fields", () => {
    const result = updateUserSchema.safeParse({
      email: null,
      phone: null,
      positionId: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("assignRoleSchema", () => {
  it("should accept valid roleId", () => {
    const result = assignRoleSchema.safeParse({ roleId: 1 });
    expect(result.success).toBe(true);
  });

  it("should reject missing roleId", () => {
    const result = assignRoleSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject non-positive roleId", () => {
    const result = assignRoleSchema.safeParse({ roleId: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject non-integer roleId", () => {
    const result = assignRoleSchema.safeParse({ roleId: 1.5 });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("should accept valid password change", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "anything",
      newPassword: "NewValidPass@12345",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "NewValidPass@12345",
    });
    expect(result.success).toBe(false);
  });

  it("should reject weak new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old",
      newPassword: "weak",
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("should accept valid password", () => {
    const result = resetPasswordSchema.safeParse({ password: "ResetPassword@123" });
    expect(result.success).toBe(true);
  });

  it("should reject weak password", () => {
    const result = resetPasswordSchema.safeParse({ password: "weak" });
    expect(result.success).toBe(false);
  });
});
