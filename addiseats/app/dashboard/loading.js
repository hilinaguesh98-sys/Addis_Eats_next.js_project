export default function DashboardLoading() {
  return <div className="page-wrap container" aria-busy="true" aria-label="Loading staff dashboard">
    <div className="page-title"><div className="skeleton skeleton-eyebrow"></div><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-copy"></div></div>
    <div className="dashboard-summary">
      <div className="skeleton dashboard-loading-metric"></div>
      <div className="skeleton dashboard-loading-metric"></div>
    </div>
    <div className="dashboard-charts">
      <section className="skeleton dashboard-loading-chart" aria-hidden="true"></section>
      <section className="skeleton dashboard-loading-chart" aria-hidden="true"></section>
    </div>
  </div>
}
