import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  requireRole,
  parseBody,
  handleApiError,
} from "@/lib/api-utils";
import { createUserSchema } from "@/lib/validations/user";
import { createAuditLog } from "@/lib/audit-log";
import { hashPassword } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await requireRole("ADMIN", "MANAGER");
    const userId = Number(session.user.id);
    const isAdmin = session.user.roles.includes("ADMIN");

    const where = isAdmin ? {} : { managerId: userId };

    const users = await prisma.userProfile.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        lastNameFirstName: true,
        sapId: true,
        phone: true,
        startDate: true,
        endDate: true,
        hseBlocked: true,
        passwordChangedAt: true,
        positionId: true,
        position: { select: { id: true, name: true } },
        organisationalUnitId: true,
        organisationalUnit: { select: { id: true, name: true } },
        managerId: true,
        manager: { select: { id: true, username: true, lastNameFirstName: true } },
        hseManagerId: true,
        roles: { include: { role: true } },
      },
      orderBy: { username: "asc" },
    });

    return apiResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN");
    const data = await parseBody(request, createUserSchema);

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.userProfile.create({
      data: {
        username: data.username,
        email: data.email ?? null,
        password: hashedPassword,
        lastNameFirstName: data.lastNameFirstName ?? null,
        sapId: data.sapId,
        phone: data.phone ?? null,
        positionId: data.positionId ?? null,
        organisationalUnitId: data.organisationalUnitId ?? null,
        managerId: data.managerId ?? null,
        hseManagerId: data.hseManagerId ?? null,
        passwordChangedAt: null, // force change on first login
      },
    });

    await createAuditLog(
      Number(session.user.id),
      "CREATE",
      "USER_PROFILE",
      user.id
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = user as Record<string, unknown>;
    return apiResponse(userWithoutPassword, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
