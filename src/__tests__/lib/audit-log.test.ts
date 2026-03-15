import { createAuditLog } from "@/lib/audit-log";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: jest.fn().mockResolvedValue({
        id: 1,
        actorId: 1,
        action: "CREATE",
        entityType: "USER_PROFILE",
        entityId: "5",
        createdAt: new Date(),
      }),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("createAuditLog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an audit log entry with correct data", async () => {
    await createAuditLog(1, "CREATE", "USER_PROFILE", 5);

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: 1,
        action: "CREATE",
        entityType: "USER_PROFILE",
        entityId: "5",
      },
    });
  });

  it("should convert numeric entityId to string", async () => {
    await createAuditLog(2, "UPDATE", "POSITION", 10);

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: 2,
        action: "UPDATE",
        entityType: "POSITION",
        entityId: "10",
      },
    });
  });

  it("should handle string entityId", async () => {
    await createAuditLog(1, "DELETE", "POSITION", "ENGINEER");

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: 1,
        action: "DELETE",
        entityType: "POSITION",
        entityId: "ENGINEER",
      },
    });
  });

  it("should be called with different action types", async () => {
    const actions = ["CREATE", "UPDATE", "DELETE", "RESET_PASSWORD", "UNLOCK_HSE", "ADD_ROLE", "REMOVE_ROLE"];

    for (const action of actions) {
      await createAuditLog(1, action, "USER_PROFILE", 1);
    }

    expect(prisma.auditLog.create).toHaveBeenCalledTimes(actions.length);
  });
});
