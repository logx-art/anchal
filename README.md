# Anchal — Indian Women's Fashion Boutique E-Commerce Platform

A full-stack e-commerce site for Anchal: sarees, kurtis, and nightwear, with a complete customer
storefront, secure Razorpay checkout, and an admin panel a non-technical store owner can run day to day.

## Project overview

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js Route Handlers + Server Actions (same codebase, no separate API server)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Auth.js (NextAuth v5), credential login with Argon2id password hashing
- **Payments:** Razorpay (UPI / cards / net banking), server-verified — see `docs/01-ARCHITECTURE.md` §5
- **Images:** Cloudinary, signed direct-to-cloud uploads from the admin panel

Full architecture reasoning, the ER-level data model, and the folder layout are in `docs/01-ARCHITECTURE.md`
and `docs/02-FOLDER-STRUCTURE.md` — read those first if you're extending this project.

## Prerequisites

- Node.js 18.18 or newer
- A PostgreSQL database (local, or a free tier on [Neon](https://neon.tech) / [Supabase](https://supabase.com) / [Railway](https://railway.app))
- A [Razorpay](https://razorpay.com) account (test mode is fine to start)
- A [Cloudinary](https://cloudinary.com) account (free tier is fine to start)

## Installation

```bash
npm install
```

`postinstall` runs `prisma generate` automatically.

## Environment variables

```bash
cp .env.example .env
```

Then fill in every value in `.env`. See the comments in `.env.example` for where each one comes from.
**Never commit `.env`** — it's already in `.gitignore`.

## Database setup

1. Point `DATABASE_URL` in `.env` at your Postgres instance.
2. Run the migrations:
   ```bash
   npm run db:migrate
   ```
   This creates every table in `prisma/schema.prisma` (users, products, orders, coupons, etc.) and prompts
   you to name the migration on first run.
3. Seed realistic development data (30 products across Sarees/Kurtis/Nightwear, an admin account, a test
   customer, two coupons, and homepage banners):
   ```bash
   npm run db:seed
   ```
   The seed script prints the admin and test customer logins when it finishes. Default admin login:
   `admin@anchal.in` / `ChangeMe123!` — **change this password immediately** via Admin → Store Settings
   once you're running against a real database, or before deploying anywhere public.

To inspect the database visually at any point: `npm run db:studio`.

## Razorpay setup

1. In the [Razorpay Dashboard](https://dashboard.razorpay.com), grab your test **Key ID** and **Key Secret**
   from Settings → API Keys, and put them in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
2. Create a webhook under Settings → Webhooks pointing at `https://<your-domain>/api/payments/webhook`,
   subscribed to at least `payment.captured` and `payment.failed`. Put its signing secret in
   `RAZORPAY_WEBHOOK_SECRET`. Locally, use the [Razorpay CLI](https://razorpay.com/docs/webhooks/) or a
   tunnel (ngrok, ngrok-alternatives) to receive webhooks during development.
3. Payments are server-verified: the browser only ever sees `RAZORPAY_KEY_ID` (public). See
   `docs/01-ARCHITECTURE.md` §5 for the full signature-verification flow.

## Cloudinary setup

1. From the Cloudinary Dashboard, copy your Cloud Name, API Key, and API Secret into `.env`.
2. No further configuration is needed — the admin panel's image uploader (`/admin/products/new`) requests
   a signed upload directly from `/api/uploads/sign` and uploads straight to Cloudinary from the browser.

## Running locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin` for the admin panel
(sign in with the seeded admin login first).

## Production build

```bash
npm run build
npm run start
```

`npm run build` runs `prisma generate` first, so the Prisma Client matches your schema.

## Deployment

- **App:** Deploy to [Vercel](https://vercel.com) — connect the repo, set every variable from `.env.example`
  in the Vercel project's Environment Variables, and deploy. Vercel runs `npm run build` automatically.
- **Database:** Point `DATABASE_URL` at a hosted Postgres instance (Neon, Supabase, or Railway all work
  well with Vercel). Run `npm run db:deploy` (uses `prisma migrate deploy`, safe for production) against
  that database before your first deploy, then `npm run db:seed` if you want the demo catalog live.
- Set `NEXTAUTH_URL` to your production domain, and re-point the Razorpay webhook at the production URL.

## Project structure

See `docs/02-FOLDER-STRUCTURE.md` for the full annotated tree. Key entry points:

- `prisma/schema.prisma` — the entire data model
- `prisma/seed.ts` — realistic seed data
- `src/lib/` — auth, cart, pricing, Razorpay, Cloudinary, and validation logic (the parts that don't
  belong to any one page)
- `src/lib/admin-actions.ts` — every admin mutation (Server Actions), each re-checking `requireAdmin()`
- `src/app/(shop)/` — the customer storefront
- `src/app/admin/` — the admin panel
- `src/app/api/` — Route Handlers for cart, checkout, payments, search, etc.
- `middleware.ts` + `src/lib/auth.config.ts` — edge-level route protection for `/admin` and `/account`

## Default logins (seed data)

| Role     | Email                | Password       |
|----------|-----------------------|----------------|
| Admin    | admin@anchal.in       | ChangeMe123!   |
| Customer | priya@example.com     | Customer123!   |

Change or remove these before deploying anywhere public.

## Troubleshooting

- **`prisma generate` errors on install:** make sure `DATABASE_URL` is set in `.env` before running
  `npm install` / `npm run db:migrate` — Prisma needs it to introspect/connect, even just to generate types.
- **Argon2 fails to install/build:** `@node-rs/argon2` ships prebuilt binaries for common platforms; if
  your platform isn't supported, switch `src/lib/auth.ts` and `prisma/seed.ts` to `bcryptjs` instead (pure
  JS, no native build step) and update the two `argon2Hash`/`verifyArgon2` calls accordingly.
- **Payments stuck as "Pending":** confirm the Razorpay webhook is reachable and its secret matches
  `RAZORPAY_WEBHOOK_SECRET` — the webhook is the backstop that confirms payment even if the customer closes
  the browser tab before the redirect completes.
- **Images not loading:** Next.js's `<Image>` only allows hosts explicitly listed in
  `next.config.ts` → `images.remotePatterns`. Add any new image host there.
- **Middleware/edge errors mentioning Prisma or Node natives:** middleware must only import from
  `src/lib/auth.config.ts`, never `src/lib/auth.ts` directly — the former is edge-safe (no Prisma/Argon2),
  the latter is Node-only. See the comments in `middleware.ts`.

## What's scaffolded vs. fully wired

This project implements every page, API route, and admin capability in the requirements. A few things are
intentionally left as clearly-marked placeholders for you to swap in before a public launch:
- Seed product photography uses placeholder images (`picsum.photos`) — replace with real photos uploaded
  through the admin panel's Cloudinary uploader.
- The homepage's "Styled By You" Instagram gallery and the reviews carousel use static/dev placeholder
  content — wire up the Instagram Graph API and/or pull real approved reviews once you have them.
- Transactional email (order confirmation, password reset) is not included — see the commented-out
  `RESEND_API_KEY` in `.env.example` for the intended integration point.
