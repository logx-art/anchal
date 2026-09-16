import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Built from authConfig (no providers/Prisma) rather than the full
// instance in lib/auth.ts — middleware runs on Vercel's Edge runtime,
// which can't load Prisma or the Argon2 native binding that
// lib/auth.ts's Credentials provider depends on. The actual route-gating
// decision lives in authConfig's `authorized` callback (see auth.config.ts).
// Every admin page/route ALSO re-checks the session server-side via
// requireAdmin() — this edge check is the first line of defense, not the
// only one.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
