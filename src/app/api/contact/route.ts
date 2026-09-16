import { z } from "zod";
import { apiSuccess, apiErrorFromZod } from "@/lib/api-response";

const bodySchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  message: z.string().trim().min(1),
});

// In production this would enqueue a transactional email (e.g. via
// Resend/SES) to the support inbox and a confirmation to the sender.
// Left as a clearly-marked integration point rather than a fake success.
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  console.log("[contact] New message:", parsed.data);
  // TODO: wire up an email provider here.

  return apiSuccess({ received: true }, 201);
}
