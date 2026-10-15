'use client'

export default function DashboardError({ reset }) {
  return <div className="page-wrap container">
    <section className="error-state" role="alert">
      <p className="eyebrow">STAFF DASHBOARD</p>
      <h1>We couldn't load the dashboard</h1>
      <p>Please try again. Private order details are not included in this error.</p>
      <button className="orange-button" type="button" onClick={() => reset()}>Try again</button>
    </section>
  </div>
}
