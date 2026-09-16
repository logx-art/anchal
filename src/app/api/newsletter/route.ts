import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromZod } from "@/lib/api-response";

const bodySchema = z.object({ email: z.string().trim().email() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    update: { isActive: true },
    create: { email: parsed.data.email.toLowerCase() },
  });

  return apiSuccess({ subscribed: true }, 201);
}
