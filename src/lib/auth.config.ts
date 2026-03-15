import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in auth.ts (server-only)
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username: string }).username;
        token.roles = (user as { roles: string[] }).roles;
        token.passwordChangedAt = (user as { passwordChangedAt: string | null })
          .passwordChangedAt;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.roles = token.roles as string[];
      session.user.passwordChangedAt = token.passwordChangedAt as string | null;
      return session;
    },
  },
};
