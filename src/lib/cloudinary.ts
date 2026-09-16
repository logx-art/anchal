import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // server-only, never sent to the client
});

/**
 * Generates a short-lived signature that lets the admin's browser upload
 * an image file *directly* to Cloudinary (bypassing our own server, so a
 * multi-megabyte photo isn't proxied through a Vercel function). The
 * signature is computed here, server-side, because computing it requires
 * the API secret — the browser only ever sees the signature and timestamp,
 * never the secret itself. See app/api/uploads/sign/route.ts for the route
 * that returns this to the admin UI.
 */
export function generateUploadSignature(folder = "anchal/products") {
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET ?? ""
  );

  return {
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

/** Deletes an image from Cloudinary (e.g. when an admin removes a product
 * photo) so storage doesn't accumulate orphaned files. */
export async function deleteCloudinaryImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

/** Builds a responsive, auto-optimized delivery URL from a stored public ID
 * — used wherever a product image needs a specific size (e.g. thumbnails
 * in the admin table vs. full-size on the product detail gallery). */
export function cloudinaryUrl(publicId: string, width?: number) {
  return cloudinary.url(publicId, {
    secure: true,
    quality: "auto",
    fetch_format: "auto",
    ...(width ? { width, crop: "fill" } : {}),
  });
}

export { cloudinary };
