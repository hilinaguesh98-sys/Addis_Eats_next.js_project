import Link from 'next/link'
import CsvExportButton from './CsvExportButton'
import OrderTable from './OrderTable'

function queryHref({ page, sort, order, statusFilter }) {
  const params = new URLSearchParams()
  params.set('status', statusFilter)
  params.set('sort', sort)
  params.set('order', order)
  params.set('page', String(page))
  return `/orders?${params.toString()}`
}

export default function OrdersList({ orders, exportOrders = orders, page, pageCount, sort, order, statusFilter, totalCount, hasAnyOrders }) {
  if (!hasAnyOrders || totalCount === 0) {
    const title = !hasAnyOrders ? 'You have not placed an order yet' : statusFilter === 'active' ? 'No active orders' : 'No past orders'
    return <div className="empty">
      <div className="empty-icon"></div>
      <h2>{title}</h2>
      <p className="muted">{!hasAnyOrders ? 'Explore the menu and place your first order.' : 'Try the other order-history tab or browse the menu.'}</p>
      <div className="order-empty-actions">
        <Link className="orange-button" href="/menu">Browse Menu</Link>
        {hasAnyOrders && <Link className="secondary-button" href={queryHref({ page: 1, sort, order, statusFilter: statusFilter === 'active' ? 'past' : 'active' })}>View {statusFilter === 'active' ? 'past' : 'active'} orders</Link>}
        {hasAnyOrders && <CsvExportButton orders={exportOrders} />}
      </div>
    </div>
  }

  return <section className="orders-table-section">
    <div className="orders-table-toolbar">
      <nav className="order-tabs" aria-label="Order history filter">
        <Link className={statusFilter === 'active' ? 'active' : ''} aria-current={statusFilter === 'active' ? 'page' : undefined} href={queryHref({ page: 1, sort, order, statusFilter: 'active' })}>Active Orders</Link>
        <Link className={statusFilter === 'past' ? 'active' : ''} aria-current={statusFilter === 'past' ? 'page' : undefined} href={queryHref({ page: 1, sort, order, statusFilter: 'past' })}>Past Orders</Link>
      </nav>
      <div className="orders-toolbar-actions"><p>{totalCount} {totalCount === 1 ? 'order' : 'orders'}</p><CsvExportButton orders={exportOrders} /></div>
    </div>
    <OrderTable orders={orders} page={page} pageCount={pageCount} sort={sort} order={order} statusFilter={statusFilter} />
  </section>
}
