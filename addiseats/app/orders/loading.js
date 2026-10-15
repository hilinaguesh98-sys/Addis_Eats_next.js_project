export default function OrdersLoading() {
  return <div className="page-wrap container" aria-busy="true" aria-label="Loading your orders">
    <div className="page-title"><div className="skeleton skeleton-eyebrow"></div><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-copy"></div></div>
    <div className="orders-loading-table">
      <div className="skeleton skeleton-toolbar"></div>
      <table className="semantic-orders-table" aria-hidden="true">
        <thead><tr>{Array.from({ length: 6 }, (_, index) => <th key={index}><span className="skeleton skeleton-cell"></span></th>)}</tr></thead>
        <tbody>{Array.from({ length: 5 }, (_, row) => <tr key={row}>{Array.from({ length: 6 }, (_, column) => <td key={column}><span className="skeleton skeleton-cell"></span></td>)}</tr>)}</tbody>
      </table>
    </div>
  </div>
}