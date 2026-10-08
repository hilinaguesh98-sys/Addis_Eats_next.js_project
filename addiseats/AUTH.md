# Addis Eats Authentication

## Session model

`lib/session.js` exposes the server-only `getSession()` helper. Session tokens are signed with HMAC-SHA-256, expire after seven days, and are rejected when the signature, expiry, user ID, or role is invalid. The `addis_eats_session` cookie is `httpOnly`, `secure` in production, `sameSite: 'lax'`, and scoped to `/`.

Set a unique `AUTH_SECRET` in `.env.local` for local production-mode testing and in the deployment environment. Production refuses to issue a session if it is missing. `.env*.local` is ignored by Git. `lib/users.js` contains the two classroom seed accounts, with passwords stored as scrypt hashes:

| Role | Email | Classroom password |
| --- | --- | --- |
| Customer | `hilina@gmail.com` | `123` |
| Staff | `stuff@gmail.com` | `12345` |

These fixed credentials are for the classroom demo only, not production users.

## Private routes and defense layers

| Route | Middleware layer | Server/page layer | Action, query, or write layer |
| --- | --- | --- | --- |
| `/checkout` and `/cart/checkout` | `middleware.js` verifies a valid session cookie. | Both server pages verify `getSession()` before rendering checkout. | `placeOrder` calls `getSession()` again and uses only `session.id` as the new order owner. `POST /api/orders` independently repeats session and input checks. |
| `/orders` | `middleware.js` verifies a valid session cookie. | The page verifies `getSession()` again and calls only `getOrdersForUser(session.id)`. | `GET /api/orders` independently requires a session and scopes results to its ID. |
| `/orders/[id]` | `middleware.js` verifies a valid session cookie. | The page verifies the session and calls `getOrderForUser(id, session.id)`; another user's order is returned as not-found. | `GET /api/orders/[id]` independently requires a session and applies the same owner check. |
| `/order-confirmation/[id]` | `middleware.js` verifies a valid session cookie. | The server page verifies the session and loads the order through `getOrderForUser(id, session.id)` before rendering. | The underlying order API also requires a session and checks ownership. |
| `/kitchen` | `middleware.js` verifies a valid session cookie. | The server page requires `session.role === 'staff'` before calling the all-orders query. | `updateOrderStatus` verifies the current session and `role === 'staff'` before changing status in the existing order store. |

Middleware is an early redirect layer, not the final authorization boundary. The server-page checks prevent private data from being rendered without a current session, and the query/action checks prevent direct requests from bypassing page navigation. Order IDs are never used alone to authorize access: each private order read pairs the requested ID with the currently verified session ID.

The order store is an in-memory classroom data store. It resets when the server restarts; owner checks still apply to every customer order read and staff role checks apply to every status write. Existing status names (`Preparing`, `Ready`, `Out for delivery`, `Delivered`, `Cancelled`) are preserved.

## Safe sign-in return paths

Middleware retains the requested internal path in the `next` parameter. `getSafeNext()` rejects destinations that are not a string beginning with exactly one `/`, protocol-relative URLs, backslashes, and `/signin`. Both the sign-in page and API fall back to `/` for an invalid destination, so an external URL can never become a redirect target.

Try `/signin?next=https%3A%2F%2Fexample.com`. After a successful sign-in, the destination is `/`, not the external site.

## Required attack checks

1. **Signed-out write:** send `DELETE /api/orders/{id}` or call `placeOrder` without a session. No cancellation endpoint is implemented, so DELETE is not allowed; `placeOrder` returns an authentication error and `POST /api/orders` returns HTTP 401 without a valid session.
2. **Another user's order ID:** sign in as a different customer and request `/orders/{id}`, `/order-confirmation/{id}`, or `GET /api/orders/{id}`. Server queries compare both the ID and `session.id`; pages return not-found and the API returns HTTP 404.
3. **External `next` URL:** request `/signin?next=https%3A%2F%2Fexample.com`, then submit sign-in. The server-side allowlist replaces the URL with `/`; it cannot redirect to the external origin.
4. **Customer kitchen write:** call `updateOrderStatus` directly while signed in as a customer. The server action returns `Only staff can update order status.` and leaves the order unchanged.

## Manual verification

1. Open `/orders`, `/order-confirmation/{id}`, `/checkout`, `/cart/checkout`, and `/kitchen` while signed out; each is redirected to `/signin`.
2. Sign in with a classroom customer account and confirm `/orders` contains only that user's orders.
3. Request a different user's order ID in both the URL and `/api/orders/{id}`; confirm the page is not-found and the API returns 404.
4. Open `/kitchen` as a customer (redirect to `/orders`) and as staff (authorized dashboard); update an order as staff and confirm the customer status polling API returns the new status.
5. Submit an unauthenticated order write and attempt `updateOrderStatus` as a customer; confirm both are rejected. The app has no customer cancellation endpoint.
6. Submit a malicious external `next` value and confirm no external redirect occurs.
