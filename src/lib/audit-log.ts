import { prisma } from "@/lib/prisma";

export async function createAuditLog(
  actorId: number,
  action: string,
  entityType: string,
  entityId: string | number
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId: String(entityId),
    },
  });
}
