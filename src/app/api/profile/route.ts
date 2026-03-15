import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  apiError,
  requireAuth,
  handleApiError,
} from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.userProfile.findUnique({
      where: { id: Number(session.user.id) },
      select: {
        id: true,
        username: true,
        email: true,
        lastNameFirstName: true,
        sapId: true,
        phone: true,
        imagePath: true,
        startDate: true,
        position: { select: { id: true, name: true } },
        organisationalUnit: { select: { id: true, name: true } },
        manager: { select: { id: true, username: true, lastNameFirstName: true } },
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}
