# AddisEats Boundary Map

| Component / file | Side | Why |
|---|---|---|
| `app/layout.js` | Server | Resolves the current session for the header and defines metadata. |
| `components/Header.js` | Client | Reads pathname and browser cart state. |
| `components/DishCard.js` | Client | Favorite and cart buttons use localStorage. |
| `components/CartClient.js` | Client | Cart quantity state and localStorage belong in the browser. |
| `components/Footer.js` | Server | Static navigation and footer content. |
| `app/actions.js` | Server | Validates checkout data and creates orders on the server. |
| `lib/data.js` | Shared | Canonical dish data is used by pages, actions, and API handlers. |
| `lib/orders.js` | Server | Order storage is server-side. |
| `app/api/*` | Server | API route handlers execute on the server. |
| `app/page.js` / `app/HomeClient.jsx` | Server page / Client UI | Public home content is server-rendered; search and category filters are interactive. |
| `app/menu/page.js` / `app/menu/SearchBox.jsx` | Server page / Client UI | Menu data is server-rendered; debounced search and filters are interactive. |
| `app/menu/[id]/page.js` / `DishDetailClient.jsx` | Server page / Client UI | Dish data, metadata, and structured data are server-rendered; quantity and add-to-cart controls are interactive. |
| `app/favorites/page.js` | Client | Reads and reacts to localStorage. |
| `app/cart/page.js` | Server | Provides the route shell for the client cart component. |
| `app/cart/checkout/page.js` / `CheckoutClient.jsx` | Server page / Client UI | Middleware protects the route; form state is client-side and order creation is authorized in a server action. |
| `app/orders/page.js` / `OrdersList.jsx` | Server page / Client UI | Session-scoped history is fetched on the server; active/past tabs are interactive. |
| `app/order-confirmation/[id]/page.js` / `OrderConfirmationClient.jsx` | Server page / Client UI | The owner-scoped order is fetched and authorized on the server before rendering. |
| `app/orders/[id]/page.js` / `OrderStatus.jsx` | Server page / Client UI | The authorized initial status is server-rendered; SWR polls for updates. |
| `app/kitchen/page.js` | Server | Verifies session and staff role before querying orders. |
| `app/mobile-flow/page.js` | Server | Static responsive-flow documentation. |
