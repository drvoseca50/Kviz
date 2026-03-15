import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/login", "/api/auth"];

const roleRouteMap: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/manager": ["ADMIN", "MANAGER"],
  "/user": ["ADMIN", "MANAGER", "USER"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const user = req.auth?.user;

  // Unauthenticated → login
  if (!user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Force password change if not yet changed or expired (within 3 days)
  // Skip API routes — they handle auth independently via requireAuth/requireRole
  if (pathname !== "/change-password" && !pathname.startsWith("/api/")) {
    const passwordChangedAt = user.passwordChangedAt
      ? new Date(user.passwordChangedAt)
      : null;

    if (!passwordChangedAt) {
      return NextResponse.redirect(new URL("/change-password", req.nextUrl.origin));
    }

    const deadline = new Date(passwordChangedAt);
    deadline.setDate(deadline.getDate() + 3);
    if (new Date() > deadline) {
      return NextResponse.redirect(new URL("/change-password", req.nextUrl.origin));
    }
  }

  // Role-based route protection
  for (const [routePrefix, allowedRoles] of Object.entries(roleRouteMap)) {
    if (pathname.startsWith(routePrefix)) {
      const userRoles = user.roles ?? [];
      const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasAccess) {
        const redirectPath = userRoles.includes("ADMIN")
          ? "/admin/dashboard"
          : userRoles.includes("MANAGER")
            ? "/manager/dashboard"
            : "/user/dashboard";
        return NextResponse.redirect(new URL(redirectPath, req.nextUrl.origin));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
