# Anchal — Project Folder Structure

**Phase 2 deliverable.** Reflects the architecture in `01-ARCHITECTURE.md` and the models in `prisma/schema.prisma`. Built for Next.js 14 App Router, with a clean separation between storefront, admin, API, and shared code so no file grows into a monolith (§42).

```
anchal/
├── .env.example
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── middleware.ts                     # role-based route protection (§2)
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                       # realistic seed data (§43)
│   └── migrations/
│
├── public/
│   └── favicon, static marketing assets only (product images live on Cloudinary)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # root layout: fonts, global providers
│   │   ├── page.tsx                   # Homepage
│   │   ├── globals.css
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   │
│   │   ├── (shop)/                    # customer-facing route group
│   │   │   ├── layout.tsx             # storefront header/footer
│   │   │   ├── shop/page.tsx          # All Products
│   │   │   ├── [categorySlug]/page.tsx  # Sarees / Kurtis / Nightwear (dynamic)
│   │   │   ├── new-arrivals/page.tsx
│   │   │   ├── sale/page.tsx
│   │   │   ├── product/[slug]/page.tsx  # Product Details
│   │   │   ├── search/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── checkout/success/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── policies/
│   │   │       ├── shipping/page.tsx
│   │   │       ├── returns/page.tsx
│   │   │       ├── privacy/page.tsx
│   │   │       └── terms/page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── account/                   # requires auth (middleware-protected)
│   │   │   ├── layout.tsx             # dashboard shell + sidebar
│   │   │   ├── page.tsx               # Profile
│   │   │   ├── addresses/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[orderNumber]/page.tsx
│   │   │   └── wishlist/page.tsx
│   │   │
│   │   ├── admin/                     # requires ADMIN role
│   │   │   ├── layout.tsx             # admin shell + sidebar (§22)
│   │   │   ├── page.tsx               # Dashboard metrics (§23)
│   │   │   ├── products/
│   │   │   │   ├── page.tsx           # list + search/filter/sort
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── coupons/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   ├── homepage/page.tsx      # hero/promo banners, featured picks (§32)
│   │   │   └── settings/page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── products/route.ts              # GET (list/filter), POST (admin create)
│   │       ├── products/[id]/route.ts          # GET/PATCH/DELETE
│   │       ├── categories/route.ts
│   │       ├── search/route.ts
│   │       ├── cart/route.ts
│   │       ├── cart/items/route.ts
│   │       ├── wishlist/route.ts
│   │       ├── checkout/route.ts               # creates Order + Razorpay order (txn)
│   │       ├── payments/verify/route.ts        # HMAC signature verification
│   │       ├── payments/webhook/route.ts       # Razorpay webhook (idempotent)
│   │       ├── orders/route.ts
│   │       ├── orders/[orderNumber]/route.ts
│   │       ├── coupons/validate/route.ts
│   │       ├── newsletter/route.ts
│   │       ├── reviews/route.ts
│   │       ├── pincode-check/route.ts          # delivery availability (§19)
│   │       ├── uploads/sign/route.ts           # signed Cloudinary upload
│   │       └── admin/
│   │           ├── stats/route.ts
│   │           ├── products/... (bulk actions: duplicate, status change)
│   │           ├── orders/[id]/status/route.ts
│   │           ├── inventory/route.ts
│   │           └── banners/route.ts
│   │
│   ├── components/
│   │   ├── ui/                        # generic building blocks (Button, Modal, Drawer,
│   │   │   │                          # Badge, Skeleton, EmptyState, ErrorState, Toast)
│   │   ├── layout/                    # Header, Footer, MobileNav, MobileBottomNav
│   │   ├── product/                   # ProductCard, ProductGrid, ProductGallery,
│   │   │   │                          # QuantitySelector, WishlistButton, AddToCartButton,
│   │   │   │                          # Filters (+ MobileFilterDrawer), SortDropdown
│   │   ├── cart/                      # CartItemRow, CartSummary, CouponField
│   │   ├── checkout/                  # CheckoutForm, AddressForm, PincodeCheck
│   │   ├── account/                   # AccountSidebar, OrderStatusBadge
│   │   ├── admin/                     # AdminSidebar, DataTable, ProductForm,
│   │   │   │                          # StatCard, OrderStatusSelect, ConfirmDialog
│   │   └── home/                      # Hero, CategoryCards, FeaturedTabs, PromoBanner,
│   │                                  # WhyShopWithUs, ReviewsCarousel, InstagramGallery,
│   │                                  # NewsletterForm
│   │
│   ├── lib/
│   │   ├── prisma.ts                  # singleton Prisma client
│   │   ├── auth.ts                    # Auth.js config + session/role helpers
│   │   ├── razorpay.ts                # server-only Razorpay client + signature verify
│   │   ├── cloudinary.ts              # signed-upload helper
│   │   ├── cart.ts                    # guest/user cart resolution + merge-on-login
│   │   ├── pricing.ts                 # server-side price/discount/coupon calculation
│   │   ├── validations/               # Zod schemas (shared client+server)
│   │   │   ├── auth.ts
│   │   │   ├── product.ts
│   │   │   ├── checkout.ts
│   │   │   └── coupon.ts
│   │   └── api-response.ts            # success/error envelope helpers
│   │
│   ├── hooks/                         # useCart, useWishlist, useDebounce, useMediaQuery
│   ├── types/                         # shared TS types not derivable from Prisma
│   └── config/                        # site.ts (nav links, brand copy), categories.ts
│
└── docs/
    ├── 01-ARCHITECTURE.md
    └── 02-FOLDER-STRUCTURE.md
```

## Key conventions

- **Route groups** `(shop)` and `(auth)` share the App Router's `layout.tsx` nesting without adding a URL segment — `/shop`, not `/(shop)/shop`.
- **`[categorySlug]`** is a single dynamic route rather than separate `sarees/`, `kurtis/`, `nightwear/` folders — this is what makes "add a category without restructuring" (§10/§27) actually true at the routing level, not just the database level.
- Every `admin/**` page and every `api/admin/**` route is covered by `middleware.ts` role-gating plus a server-side session re-check inside the handler itself (belt and suspenders, per the security architecture).
- `components/ui` never imports from `components/product|cart|admin|...` — dependencies flow one direction (generic → feature-specific) to keep the component tree easy to reason about as it grows.

## Next steps (Phases 4+)

With architecture, schema, and structure agreed, the next buildable chunks are:
1. Seed data + migrations (`prisma/seed.ts`)
2. Core `lib/` utilities (prisma client, auth config, pricing/cart logic)
3. Customer-facing pages, starting with homepage → shop → product detail → cart → checkout
4. Admin panel
5. Razorpay + Cloudinary wiring

Let me know which of these to tackle next, or if you'd like changes to the schema or structure first.
