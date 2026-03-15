import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth-utils";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        const user = await prisma.userProfile.findUnique({
          where: { username },
          include: {
            roles: {
              include: { role: true },
            },
          },
        });

        if (!user) return null;

        // Check if account is locked
        if (user.lockedUntil && new Date() < user.lockedUntil) {
          return null;
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          // Increment failed login attempts
          await prisma.userProfile.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: { increment: 1 },
            },
          });
          return null;
        }

        // Reset failed attempts on successful login
        if (user.failedLoginAttempts > 0) {
          await prisma.userProfile.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: String(user.id),
          username: user.username,
          email: user.email,
          roles: user.roles.map((r) => r.role.name),
          passwordChangedAt: user.passwordChangedAt?.toISOString() ?? null,
        };
      },
    }),
  ],
});
