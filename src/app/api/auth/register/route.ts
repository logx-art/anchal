import { hash as argon2Hash } from "@node-rs/argon2";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { apiSuccess, apiError, apiErrorFromZod } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    return apiError(
      "ACCOUNT_EXISTS",
      existing.email === email
        ? "An account with this email already exists. Try signing in instead."
        : "An account with this phone number already exists.",
      409
    );
  }

  const passwordHash = await argon2Hash(password);

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "CUSTOMER" },
    select: { id: true, name: true, email: true },
  });

  return apiSuccess(user, 201);
}
