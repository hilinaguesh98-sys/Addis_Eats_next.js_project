# AddisEats Strategy

| Route | Strategy | Reason |
|---|---|---|
| `/` | Client page with local filtering | Search and category controls are interactive and the home screen needs instant filtering. |
| `/menu` | Client page | Category, search, and sorting change without a navigation request. |
| `/menu/[id]` | Client detail page | Quantity and add-to-cart controls are interactive. |
| `/favorites` | Client page | Favorites live in browser localStorage. |
| `/cart` | Server shell + client cart | The route itself is simple while cart state belongs to the browser. |
| `/cart/checkout` | Client form + server action | The browser collects delivery details, while the server validates and creates the order. |
| `/orders` | Client page | The browser fetches the current order list from the API. |
| `/order-confirmation/[id]` | Client page | The order is fetched by id and displayed after checkout. |
| `/mobile-flow` | Server page | This screen is static documentation of the responsive flow. |
| `/api/dishes` | Route handler | Exposes the canonical menu data to clients. |
| `/api/dishes/[id]` | Dynamic route handler | Returns one dish and a 404 for an unknown id. |
| `/api/orders` | Route handler | Lists orders and validates direct order submissions. |
| `/api/orders/[id]` | Dynamic route handler | Returns one order or 404. |

## Data

The supplied dish dataset is the source of truth in `lib/data.js`. The image fields use imports from `app/assets` so Next.js can bundle the files safely.
