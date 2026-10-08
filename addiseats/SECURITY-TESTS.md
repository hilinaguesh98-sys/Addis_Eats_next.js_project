# Security Verification

Run browser and API checks against the local dev server or a successfully built deployment. Session cookies are `secure`, so use HTTPS for production verification; localhost supports the classroom development flow.

## Signed-out requests

1. Open `/orders`, `/orders/AE-0000`, `/order-confirmation/AE-0000`, `/cart/checkout`, and `/kitchen` without a session. Each route redirects to `/signin?next=...`.
2. Request `GET /api/orders` and `GET /api/orders/AE-0000` without a session. Expect HTTP 401.
3. Submit a valid-looking `POST /api/orders` without a session. Expect HTTP 401 and no order.
4. Call the `placeOrder` server action without a session. Expect its authentication error and no order.
5. Send `DELETE /api/orders/AE-0000`. Expect HTTP 405 because no cancellation endpoint exists; there is no order-cancel action.

## Ownership and role checks

1. Sign in as one account and place an order. Save its generated ID.
2. Sign out and sign in as a different account. Request the first account's order through `/orders/{id}`, `/order-confirmation/{id}`, and `GET /api/orders/{id}`.
3. Confirm the pages show not-found without order details and the API returns HTTP 404. The order history response must contain only the current account's orders.
4. Sign in as a customer and open `/kitchen`; the server redirects to `/orders`. Sign in as staff and confirm `/kitchen` is accessible.

## Redirect validation

1. Open `/signin?next=https%3A%2F%2Fexample.com`.
2. Submit valid classroom credentials.
3. Confirm the response's `redirectTo` is `/` and the browser stays on the Addis Eats origin. Also test protocol-relative `next=%2F%2Fexample.com` and a backslash path.

## Cookie and environment

1. Inspect the sign-in `Set-Cookie` response without copying or logging its token. Confirm `HttpOnly`, `Secure`, `SameSite=Lax`, and `Path=/`.
2. Confirm `.env.local` is ignored by Git and `.env.example` contains placeholder values only.
3. Sign out using the header or `DELETE /api/auth`, then verify `GET /api/auth` returns `{ "user": null }`.

See [AUTH.md](./AUTH.md) for the authorization layers and expected attack outcomes.
