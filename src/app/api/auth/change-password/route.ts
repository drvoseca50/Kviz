import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validatePassword, verifyPassword, hashPassword } from "@/lib/auth-utils";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current password and new password are required" },
      { status: 400 }
    );
  }

  const user = await prisma.userProfile.findUnique({
    where: { id: Number(session.user.id) },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isCurrentValid = await verifyPassword(currentPassword, user.password);
  if (!isCurrentValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.errors.join(". ") },
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  return NextResponse.json({ message: "Password changed successfully" });
}
