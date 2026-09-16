import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

// -----------------------------------------------------------------------
// Split per Auth.js v5's documented middleware pattern: middleware runs on
// the Edge runtime, which can't load Prisma/argon2 (Node-only natives).
// This file holds everything that IS edge-safe — callbacks and the route
// gating logic — with an empty providers array. lib/auth.ts imports this
// and adds the Credentials provider (which does touch Prisma) for the
// full, Node-runtime NextAuth instance used by API routes and Server
// Components. Middleware only ever loads this file.
// -----------------------------------------------------------------------

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [], // populated in lib/auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: "CUSTOMER" | "ADMIN" }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
    // Runs on every request middleware matches (see middleware.ts matcher).
    // Belt-and-suspenders note: every admin Server Component/route ALSO
    // calls requireAdmin() itself — this edge check is the first line of
    // defense, not the only one.
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn || role !== "ADMIN") {
          return NextResponse.redirect(
            new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
          );
        }
        return true;
      }

      if (pathname.startsWith("/account")) {
        if (!isLoggedIn) {
          return NextResponse.redirect(
            new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
          );
        }
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
