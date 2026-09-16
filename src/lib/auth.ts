import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify as verifyArgon2 } from "@node-rs/argon2";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/lib/auth.config";

// -----------------------------------------------------------------------
// This is the full, Node-runtime NextAuth instance — used by the
// api/auth/[...nextauth] route handler and by Server Components/Server
// Actions that call auth()/requireUser()/requireAdmin(). It extends the
// edge-safe authConfig (see auth.config.ts) with the one provider that
// needs Prisma + Argon2, both of which require the Node runtime.
// -----------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Same generic failure path whether the email doesn't exist or the
        // password is wrong — never reveal which one it was.
        if (!user || !user.passwordHash) return null;

        const passwordValid = await verifyArgon2(user.passwordHash, password);
        if (!passwordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});

// -----------------------------------------------------------------------
// Server-side helpers. Route handlers and admin pages should call these
// rather than reading the session directly, so the "require admin" check
// lives in exactly one place.
// -----------------------------------------------------------------------

export async function requireUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
