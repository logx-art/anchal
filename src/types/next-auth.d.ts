import { DefaultSession } from "next-auth";

// Extends Auth.js's built-in types with the two fields our app relies on
// everywhere (id, role), so `session.user.role` is type-checked instead of
// requiring `as` casts at every call site.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "CUSTOMER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "ADMIN";
  }
}
