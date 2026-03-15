import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    roles: string[];
    passwordChangedAt: string | null;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email?: string | null;
      roles: string[];
      passwordChangedAt: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    roles: string[];
    passwordChangedAt: string | null;
  }
}
