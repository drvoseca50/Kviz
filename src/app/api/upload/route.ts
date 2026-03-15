import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, requireAuth, handleApiError } from "@/lib/api-utils";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/profiles");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file provided", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Only JPEG, PNG, and WebP images are allowed", 400);
    }

    if (file.size > MAX_SIZE) {
      return apiError("File size must be under 2MB", 400);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const imagePath = `/uploads/profiles/${filename}`;

    await prisma.userProfile.update({
      where: { id: Number(session.user.id) },
      data: { imagePath },
    });

    return apiResponse({ imagePath });
  } catch (error) {
    return handleApiError(error);
  }
}
