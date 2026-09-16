import { pincodeCheckSchema } from "@/lib/validations/checkout";
import { apiSuccess, apiErrorFromZod } from "@/lib/api-response";

// -----------------------------------------------------------------------
// Placeholder delivery-availability logic. There's no real courier API
// wired up yet, so this uses a simple rule (serviceable unless the PIN
// starts with a small set of known-remote prefixes) purely so the UI has
// something real to check against in development.
//
// To integrate a real provider (Delhivery, Shiprocket, etc.) later:
// swap the body of this function for an API call, keeping the same
// request/response contract — no frontend changes needed.
// -----------------------------------------------------------------------

const UNSERVICEABLE_PREFIXES = ["79"]; // e.g. parts of the Northeast in this placeholder ruleset

export async function POST(request: Request) {
  const parsed = pincodeCheckSchema.safeParse(await request.json());
  if (!parsed.success) return apiErrorFromZod(parsed.error);

  const { pincode } = parsed.data;
  const deliverable = !UNSERVICEABLE_PREFIXES.some((prefix) => pincode.startsWith(prefix));

  return apiSuccess({
    deliverable,
    etaDays: deliverable ? 5 : undefined,
    message: deliverable
      ? "Delivery available — usually arrives in 4–7 business days."
      : "Sorry, we don't currently deliver to this PIN code.",
  });
}
