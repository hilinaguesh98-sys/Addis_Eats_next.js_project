# Addis Eats

Addis Eats is a JavaScript food-delivery capstone built with the Next.js App Router. It showcases an Addis Ababa menu, client-side cart and favorites, secure classroom sign-in, and private order tracking.

## Main routes

- `/` - Home
- `/menu` - Server-rendered menu, categories, debounced search, sort, and paging
- `/menu/[id]` - Dish detail, structured data, and dish-specific social preview
- `/favorites` - Browser-saved dishes
- `/cart` - Browser cart
- `/cart/checkout` - Protected checkout
- `/orders` and `/orders/[id]` - Private, session-scoped order history and live status
- `/order-confirmation/[id]` - Private, owner-scoped confirmation
- `/kitchen` - Staff-only kitchen dashboard
- `/mobile-flow` - Responsive ordering flow
- `/signin` - Sign-in

## Main features

- HMAC-signed sessions in a secure, `httpOnly` cookie; proxy, page, and data/write authorization checks.
- Order reads scoped to the signed-in session, with not-found behavior for another user's order ID.
- Server rendering for menu, dishes, order history, order status seed data, and confirmation data.
- Debounced client menu search and five-second SWR order-status polling.
- `next/image` food photography, `next/font` Manrope, metadata, JSON-LD, a real-data sitemap, and private-route robots rules.
- Local demo food data and an in-memory order store. Demo orders are cleared when the server restarts.

## Install and run locally

Run these commands from this directory:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env.local` and replace `AUTH_SECRET` with a unique random value. `.env.local` is ignored by Git. The checked-in accounts in `lib/users.js` are classroom-only; use the current classroom credentials and never reuse them in production.

## Build and run production

```powershell
npm run build
npm start
```

Optionally set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS site origin before the build/deployment. It supplies absolute metadata, sitemap, and robots URLs. Vercel deployment domains are detected automatically when it is unset.

## Current verification status

`npm run build` compiles and completes its type check, but currently fails during Next.js 16.3.6 prerendering with `Invariant: Expected workStore to be initialized` in generated metadata work (the failing generated route varies between runs). This reproduces from a clean `.next` build with the dev server stopped; it is not a JavaScript or type-check error in the application. Production start and production Lighthouse checks must wait until a Next.js release containing the metadata work-store fix is available and installed.

## Deployment

**Deployed URL:** Not deployed yet. Set this to the production URL after deployment; verify `/`, `/sitemap.xml`, `/robots.txt`, the page source metadata, and the Open Graph preview URL on that domain.

Before deployment, configure a unique `AUTH_SECRET`, set the canonical `NEXT_PUBLIC_SITE_URL` if the platform's production domain is not auto-detected, then build and test the production deployment. The current in-memory order store is a demo limitation and is not durable across restarts or multiple server instances.

## Week 9 / Day 45 features

- Authentication and authorization: cookie-backed sessions, proxy, server-page guards, staff role check, session-scoped order access, and server-side write validation.
- Data fetching: server-first public/private data, `fallbackData` for initial live status, SWR polling, debounced search, and browser-local cart/favorites.
- Performance: image/font optimizations and measured Lighthouse results/known target gaps are recorded in [PERF.md](./PERF.md).
- SEO: route metadata, dynamic dish metadata and social preview, JSON-LD, sitemap, and robots rules.
- Implementation and attack-test details are recorded in [AUTH.md](./AUTH.md) and [DATA.md](./DATA.md).

## API routes

- `GET /api/dishes` and `GET /api/dishes/[id]`
- `GET /api/orders` and `GET /api/orders/[id]`
- `POST /api/orders`
- `GET`, `POST`, and `DELETE /api/auth` (DELETE signs out)

There is no order-cancellation endpoint in this project.
