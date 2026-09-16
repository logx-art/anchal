import { requireAdmin } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";
import { apiSuccess, apiErrors } from "@/lib/api-response";

// Admin-only: returns a short-lived signature so the admin's browser can
// upload directly to Cloudinary. See lib/cloudinary.ts for why the secret
// never leaves the server.
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return apiErrors.forbidden();

  const signature = generateUploadSignature();
  return apiSuccess(signature);
}
