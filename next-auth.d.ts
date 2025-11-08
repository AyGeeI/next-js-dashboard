import { DefaultSession } from "next-auth";

type AppRole = "ADMIN" | "STANDARD";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    username?: string | null;
    role: AppRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string | null;
    username?: string | null;
    role: AppRole;
  }
}
