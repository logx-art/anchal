# Anchal — System Architecture

**Phase 1 deliverable.** This document is the technical foundation for every later phase (database, backend, frontend, admin, payments). It maps each requirement-document section to a concrete architectural decision.

---

## 1. Technology Stack (with reasoning)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | Single codebase for customer site, admin panel, and API (route handlers). Server Components reduce client JS for a content-heavy storefront. SSR/ISR gives SEO for product pages without a separate backend service. |
| Styling | **Tailwind CSS** | Matches the "no generic template" requirement — a custom design system (warm cream/maroon/terracotta palette, serif+sans pairing) is faster to build with utility classes than fighting a component library's defaults. |
| Database | **PostgreSQL** | Relational integrity matters here: orders, inventory, coupon usage, and payments must be transactionally consistent. Required explicitly by the spec. |
| ORM | **Prisma** | Type-safe queries, migrations, and a schema that doubles as documentation. Required explicitly. |
| Auth | **Auth.js (NextAuth v5) — Credentials provider + database sessions** | See §2 below for the Better Auth vs Auth.js vs raw JWT trade-off. |
| Images | **Cloudinary** | Handles upload, resize, compression, and CDN delivery — avoids storing binary blobs in Postgres, satisfies §25/§38. |
| Payments | **Razorpay** (Orders API + webhook/signature verification) | Required explicitly. Server-authoritative flow detailed in §5. |
| Deployment | **Vercel** (app) + **Neon** or **Supabase** (Postgres) | Both give branching/preview databases that pair naturally with Vercel preview deployments. |

### 1.1 Auth decision — explained

The spec allows Better Auth, Auth.js, or a custom JWT setup and asks for reasoning if alternatives are weighed.

- **Better Auth** is newer and lighter-weight, but has a smaller ecosystem of examples for role-based (customer/admin) access patterns and Next.js App Router edge cases as of early 2026.
- **Raw custom JWT** gives full control but means re-implementing session rotation, CSRF protection, and secure cookie handling by hand — unnecessary risk for a payment-handling app.
- **Auth.js (NextAuth v5)** is chosen because: it has mature App Router support, database-session strategy (so an admin can force-revoke a session, e.g. after a suspicious login), first-class TypeScript role/session typing via callbacks, and a Credentials provider that lets us fully control password hashing (Argon2id) while still getting CSRF-safe cookie handling for free.

If requirements later call for social login (Google/Facebook) or SMS OTP, Auth.js supports adding providers without restructuring — satisfying the "future roles/providers without major restructuring" requirement.

---

## 2. Authentication & Authorization Architecture

- Passwords hashed with **Argon2id** (via `@node-rs/argon2` or `bcrypt` as fallback), never stored or logged in plain text.
- Sessions: database-backed (`Session` table), httpOnly + `Secure` + `SameSite=Lax` cookies.
- **Role field** on `User` (`CUSTOMER` | `ADMIN`), read from the session and enforced in:
  - Next.js **middleware** (`middleware.ts`) — blocks unauthenticated access to `/admin/*` and `/account/*` at the edge, before any page code runs.
  - **Server-side re-check inside every admin API route** (never trust middleware alone — defense in depth) using the session role.
- Designed so a `staff` / `manager` / `inventory-manager` role can be added later as new enum values plus a granular `Permission` join table, without touching existing auth code (§36).

---

## 3. Data / API Architecture

- **Route Handlers** under `app/api/**` for all mutations and dynamic reads (cart, checkout, admin CRUD).
- **Server Components + direct Prisma calls** for read-heavy public pages (product listing, product detail, homepage) — skips an HTTP round-trip and enables streaming/ISR.
- Consistent API envelope for every route handler:

```ts
// success
{ success: true, data: T }
// failure
{ success: false, error: { code: string, message: string, fieldErrors?: Record<string,string> } }
```

- All request bodies validated server-side with **Zod** schemas shared between client forms and API routes (one schema, two uses — prevents drift and blocks client-side-only validation bypass, per §35/§49).
- Pagination: cursor-based for product listings/search (stable under concurrent writes), offset-based for admin tables (simpler UI needs: "page 3 of 12").

---

## 4. Inventory & Order Integrity Architecture

This is the highest-risk area for data corruption (overselling, double-charging), so it gets explicit transactional design.

**Checkout flow (server-authoritative, matches §20/§49):**

1. Client sends cart contents (product/variant IDs + quantities only — **never prices**).
2. Server re-fetches current price, stock, and coupon validity from the database. Client-submitted prices are ignored entirely.
3. Server creates an `Order` (status `PENDING_PAYMENT`) and a Razorpay Order **inside a single Prisma `$transaction`**, reserving stock by decrementing `ProductVariant.stockQuantity` conditionally (`WHERE stockQuantity >= quantity`) — if the conditional update affects 0 rows, the transaction aborts and the customer sees "item no longer available" instead of an oversold order.
4. Frontend opens Razorpay Checkout with the returned `order_id`.
5. On completion, Razorpay redirects/callbacks to a server route that **recomputes the HMAC signature** from `order_id|payment_id` using the Razorpay secret and compares it to the signature Razorpay sent — only a match flips `Order.paymentStatus` to `PAID` and `Order.status` to `ORDER_PLACED`.
6. A Razorpay **webhook** (`payment.captured` / `payment.failed`) is the source of truth of record, independent of whether the customer's browser stays open — this covers the case where the user closes the tab mid-payment. Webhook and redirect-callback both call the same idempotent "confirm order" function (keyed by `razorpayOrderId`, safe to call twice).
7. If payment fails or the reservation transaction times out (e.g. 15 minutes unpaid), a scheduled job releases the reserved stock back.

This means stock is only ever decremented once, atomically, and never based on unverified frontend claims.

**Coupons:** validated and their `usedCount` incremented inside the same transaction as order creation, with a `usageLimit` check in the same atomic update — prevents two concurrent checkouts both "winning" the last use of a limited coupon.

---

## 5. Payment Architecture (Razorpay)

```
Browser                 Next.js Server (app/api/*)              Razorpay
  |  POST /api/checkout           |                                 |
  |------------------------------>|  create Order (txn) + reserve   |
  |                                |  stock                          |
  |                                |------ create order ------------>|
  |                                |<----- razorpay_order_id --------|
  |<---- order_id, key_id ---------|                                 |
  |  opens Razorpay Checkout SDK --------------------------------->  |
  |<-------------------------- payment result (client) --------------|
  |  POST /api/payments/verify    |                                 |
  |------------------------------>| verify HMAC signature server-side|
  |                                | mark order PAID, clear reservation
  |<---- redirect to order success|                                 |
                                   |<==== webhook: payment.captured ==|
                                   | (idempotent confirm, backstop)  |
```

- `RAZORPAY_KEY_SECRET` and Cloudinary/DB secrets live only in server environment variables — never sent to the client bundle (enforced by keeping all Razorpay SDK calls inside `app/api/**`, never in client components).
- Only `RAZORPAY_KEY_ID` (public) reaches the browser.

---

## 6. Image Architecture

- Admin uploads go directly from the browser to Cloudinary using a short-lived **signed upload** (signature generated by a server route using the Cloudinary secret) — the file itself never passes through our server, keeping the admin UI fast.
- `ProductImage.url` stores the Cloudinary secure URL; Next.js `<Image>` with a Cloudinary loader handles responsive `srcset` generation and lazy loading automatically (§38).
- Reordering/primary-image selection is a client drag-and-drop UI that persists `sortOrder`/`isPrimary` via a normal API call — no re-upload needed.

---

## 7. Admin Panel Architecture

- Lives under `app/admin/**`, a separate layout from the storefront (different nav, no public header/footer), gated by the middleware role check from §2.
- Shares the same design tokens (colors/type) as the storefront but a denser, utility-first layout since it's an internal tool, per §22/§46.
- Mutations (create product, update order status, etc.) use **Server Actions** where the interaction is simple form-submit-and-redirect, and Route Handlers + client fetch where the UI needs optimistic updates or stays on the same page (e.g. inline order status change in a table row).

---

## 8. SEO Architecture

- `generateMetadata()` per route for dynamic titles/descriptions (product name + category, category name, etc.).
- `app/sitemap.ts` and `app/robots.ts` (Next.js native support) generate `/sitemap.xml` and `/robots.txt` from the live product/category tables at build/request time.
- Product pages emit JSON-LD `Product` structured data (price, availability, rating) inline.
- Canonical URLs set explicitly on filtered/sorted listing pages to avoid duplicate-content issues from query strings.

---

## 9. Security Checklist (maps to §35)

| Requirement | Mechanism |
|---|---|
| Password hashing | Argon2id, per-user salt (library-managed) |
| RBAC | Session role + middleware + per-route re-check |
| Input validation | Zod on every API route, server-side, independent of client |
| Payment verification | HMAC signature recompute + webhook backstop (§5) |
| Admin route protection | Edge middleware + server-side session check |
| SQL safety | Prisma parameterized queries only, no raw string interpolation |
| Secrets | `.env` (gitignored) locally, encrypted project env vars in Vercel; nothing secret in client bundles |
| Rate limiting | IP+route based limiter (e.g. Upstash Redis) on auth and checkout endpoints |

---

## 10. What's deferred to later phases

- Exact Prisma schema → `prisma/schema.prisma` (this phase's second deliverable).
- Full route/file layout → `docs/02-FOLDER-STRUCTURE.md` (this phase's third deliverable).
- Actual page/component code, seed data, and Razorpay/Cloudinary wiring → Phases 4–7, to be built next once this architecture is confirmed.
