export default function MenuLoading() {
  return <div className="page-wrap container menu-loading" aria-busy="true" aria-label="Loading menu">
    <div className="page-title">
      <div className="skeleton skeleton-eyebrow"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-copy"></div>
    </div>
    <div className="menu-layout">
      <aside className="category-box menu-loading-categories" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => <span className="skeleton menu-loading-chip" key={index}></span>)}
      </aside>
      <section aria-hidden="true">
        <div className="menu-toolbar">
          <div className="menu-search menu-loading-search"><span className="skeleton"></span></div>
          <div className="sort-area"><span className="skeleton menu-loading-count"></span><span className="skeleton menu-loading-sort"></span></div>
        </div>
        <div className="dish-grid menu-grid menu-loading-grid">
          {Array.from({ length: 6 }, (_, index) => <article className="dish-card menu-loading-card" key={index}>
            <div className="dish-image"><div className="skeleton menu-loading-image"></div></div>
            <div className="menu-loading-body">
              <div className="skeleton menu-loading-title"></div>
              <div className="skeleton menu-loading-description"></div>
              <div className="menu-loading-bottom"><div className="skeleton menu-loading-price"></div><div className="skeleton menu-loading-button"></div></div>
            </div>
          </article>)}
        </div>
        <div className="menu-loading-pagination"><span className="skeleton"></span></div>
      </section>
    </div>
  </div>
}
