'use client'

export default function OrdersError({ reset }) {
  return <div className="page-wrap container">
    <section className="error-state" role="alert">
      <p className="eyebrow">ORDER HISTORY</p>
      <h1>We couldn't load your orders</h1>
      <p>Please try again. Your order details remain protected by your account.</p>
      <button className="orange-button" onClick={() => reset()}>Try again</button>
    </section>
  </div>
}
