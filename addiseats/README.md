# Addis Eats

Addis Eats is a JavaScript food-delivery application built with the Next.js App Router. Customers can browse the menu, save favorites, manage a cart, check out, review order history, and track order status. Staff have a protected kitchen workflow and an order/revenue dashboard.

## Routes and features

- `/` and `/menu` — searchable Addis Eats dishes, categories, and responsive menu cards.
- `/favorites`, `/cart`, and `/cart/checkout` — browser-saved favorites and cart with server-validated checkout.
- `/orders` and `/orders/[id]` — private order history, stable URL-based sorting and pagination, CSV export, and status history.
- `/track/[id]` — owner-scoped (or staff-authorized) status updates over Server-Sent Events and verified map locations when both courier and delivery coordinates exist.
- `/kitchen` — staff-only order status updates.
- `/dashboard` — staff-only server-side revenue by neighbourhood and seven-day order summary. Only aggregate chart data is sent to its client chart component.
- `/signin` — signed, HTTP-only session cookie authentication with password and optional Google sign-in.

Order records are scoped to the signed-in customer. Staff access is role-checked. The dashboard does not send order records or customer details to the browser. Accessible HTML tables accompany the charts; order tables use semantic headings, URL sort controls, and links for pagination. Controls include keyboard focus styling and menu Escape handling.

## Local installation and startup

Use Node.js and npm from this directory:

```powershell
npm install
Copy-Item .env.example .env.local
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
# Put the generated value in AUTH_SECRET in .env.local.
npm run dev
```

Open `http://localhost:3000`. The existing classroom accounts in `lib/users.js` are for local/demo use only; replace the demo authentication and account management before a public launch.

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `AUTH_SECRET` | Yes outside local development | Unique, high-entropy secret used to sign session cookies. Never commit or expose it. |
| `GOOGLE_CLIENT_ID` | Optional | Google Identity Services OAuth 2.0 Web client ID. Enables Google sign-in; Google users receive the customer role. The ID is passed to Google's browser SDK; do not configure or expose a client secret. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical site origin for metadata, sitemap, and robots URLs. Set it to the production origin in Vercel Production and to a suitable origin in Preview when canonical URLs should differ. |
| `VERCEL_URL` | Vercel-managed | Deployment hostname fallback used by site metadata. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Vercel-managed | Production hostname fallback used by site metadata. Vercel supplies these platform variables when available. |

Configure `AUTH_SECRET` in Vercel under **Settings → Environment Variables** for **Development**, **Preview**, and **Production**. To enable Google sign-in, create an OAuth 2.0 Web client in Google Cloud Console, add each app origin (such as `http://localhost:3000` and the production origin) to its authorized JavaScript origins, and set its client ID as `GOOGLE_CLIENT_ID` locally and in Vercel. Use an appropriate session secret per environment; redeploy after changing variables. `.env.local` is ignored by Git, and `.env.example` contains placeholders only.

There is no database, external session store, geocoding provider, or courier GPS integration configured in this project. No map API secret is required for the current OpenStreetMap tile layer. The map intentionally shows a fixed-height explanation instead of estimated pins unless real, valid delivery and courier coordinates are available in the order record.

## Status, timestamps, and live tracking

The order record is the source of truth. Staff can cancel active orders; delivery progress is managed by the order system. A status change writes the new status, an ISO 8601 UTC `updatedAt`, an incremented order version, and a status-history entry before the tracking stream can observe it. Delivered and cancelled orders are final. The SSE route emits the order ID, status, version, `updatedAt`, history, and any recorded courier location. The tracking client seeds from the server-rendered order, ignores duplicate/out-of-order versions, updates status and timeline timestamps together, and closes the stream for delivered or cancelled orders. Browser-visible absolute timestamps use East Africa Time (`Africa/Addis_Ababa`); stored values remain UTC.

The current SSE handler polls the local order store every three seconds. This is adequate only for the single-process demo: process restarts lose all orders, and separate serverless instances do not share in-memory orders or idempotency keys. **Do not treat the current implementation as production-ready for durable orders.** Before deployment, configure a persistent database with a unique per-user idempotency key and atomic order creation, then use shared publish/subscribe or database-backed event delivery for cross-instance updates. Add a trusted address geocoder and courier GPS source before enabling map markers; this application does not simulate location data.

## CSV export

The order history CSV button exports only the signed-in user's orders, escapes CSV delimiters and line breaks, and protects spreadsheet formula-like values. The file uses Ethiopian birr formatting and EAT-labelled timestamps. Staff dashboard data is not included in a customer export.

## Checks

Available npm scripts:

```powershell
npm run dev
npm run build
npm start
```

There is currently no configured `lint` or automated test script. A successful `npm run build` checks compilation and Next.js production generation. Verify authorization, checkout retries, status updates, SSE reconnections, CSV downloads, and responsive/keyboard use in the running app before release.

## Production deployment

No Vercel project link, Vercel CLI, deployment credentials, database, or verified public URL is configured in this workspace. A production deployment was therefore not attempted. Configure durable persistence and the required auth environment variable in Vercel Development, Preview, and Production, then verify the deployed routes and authorization before publishing a URL.

**Verified production URL:** None; not deployed.
