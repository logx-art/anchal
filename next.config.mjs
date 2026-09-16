/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Dev-only placeholder image host used by prisma/seed.ts — remove
      // once real product photography is uploaded to Cloudinary.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/argon2"],
  },
  eslint: {
    // Linting is still run in CI/locally via `npm run lint` — this only
    // stops a lint failure from blocking `next build` on day one.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
