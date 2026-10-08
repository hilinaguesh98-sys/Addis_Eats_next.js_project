# Capstone Boundary

The capstone uses client components only where browser state is required. Navigation and static layout remain server components. Cart and favorites are browser-owned state. Checkout validation and order creation cross the boundary to `app/actions.js`, where the server becomes authoritative.
