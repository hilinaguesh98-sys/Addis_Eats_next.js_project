import Link from 'next/link'
import { getOrderStatus } from '../../lib/order-statuses'
import { etb, when } from '../../lib/format'

function queryHref({ page, sort, order, statusFilter }) {
  const params = new URLSearchParams()
  params.set('status', statusFilter)
  params.set('sort', sort)
  params.set('order', order)
  params.set('page', String(page))
  return `/orders?${params.toString()}`
}

export default function OrderTable({ orders, page, pageCount, sort, order, statusFilter }) {
  const columns = [
    { key: 'createdAt', label: 'Order date (EAT)' },
    { key: 'neighborhood', label: 'Neighbourhood' },
    { key: 'status', label: 'Status' },
    { key: 'total', label: 'Total' },
  ]

  return <>
    <div className="semantic-table-wrap">
      <table className="semantic-orders-table">
        <caption>{statusFilter === 'active' ? 'Your active orders' : 'Your past orders'} sorted by {sort}, {order === 'asc' ? 'ascending' : 'descending'}</caption>
        <thead>
          <tr>
            <th scope="col">Order</th>
            {columns.map((column) => {
              const nextOrder = sort === column.key && order === 'asc' ? 'desc' : 'asc'
              const active = sort === column.key
              return <th scope="col" key={column.key} aria-sort={active ? order === 'asc' ? 'ascending' : 'descending' : 'none'}>
                <Link href={queryHref({ page: 1, sort: column.key, order: nextOrder, statusFilter })} aria-label={`Sort by ${column.label}${active ? `, currently ${order === 'asc' ? 'ascending' : 'descending'}` : ''}`}>
                  {column.label}{active && <span aria-hidden="true">{order === 'asc' ? ' ↑' : ' ↓'}</span>}
                </Link>
              </th>
            })}
            <th scope="col">Details</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((orderRecord) => <tr key={orderRecord.id}>
            <th scope="row">#{orderRecord.id}</th>
            <td>{when(orderRecord.createdAt || orderRecord.date)}</td>
            <td>{orderRecord.neighborhood || 'Not provided'}</td>
            <td><span className="table-status">{getOrderStatus(orderRecord)}</span></td>
            <td>{etb(orderRecord.total)}</td>
            <td><Link className="table-link" href={`/orders/${encodeURIComponent(orderRecord.id)}`}>View order</Link></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <nav className="pagination" aria-label="Order pages">
      <span aria-current="page">Page {page} of {pageCount}</span>
      <div>
        {page > 1
          ? <Link href={queryHref({ page: page - 1, sort, order, statusFilter })}>Previous</Link>
          : <span aria-disabled="true">Previous</span>}
        {page < pageCount
          ? <Link href={queryHref({ page: page + 1, sort, order, statusFilter })}>Next</Link>
          : <span aria-disabled="true">Next</span>}
      </div>
    </nav>
  </>
}
