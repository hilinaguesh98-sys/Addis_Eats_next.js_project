import { redirect } from 'next/navigation'
import { getOrdersForUser } from '../../lib/orders'
import { getOrderStatus } from '../../lib/order-statuses'
import { getSession } from '../../lib/session'
import OrdersList from './OrdersList'
import { createOpenGraphMetadata } from '../../lib/site'

const title = 'Your Orders'
const description = 'See the status and details of your Addis Eats orders in one convenient place.'
const PAGE_SIZE = 20

export const metadata = {
  title,
  description,
  openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, '/orders'),
  robots: { index: false, follow: false },
}

export default async function OrdersPage({ searchParams }) {
  const session = await getSession()
  if (!session) redirect('/signin?next=%2Forders')

  const params = await searchParams
  const scalar = (value) => Array.isArray(value) ? value[0] : value
  const allowedSorts = ['createdAt', 'total', 'status', 'neighborhood']
  const requestedSort = scalar(params?.sort)
  const sort = allowedSorts.includes(requestedSort) ? requestedSort : 'createdAt'
  const requestedOrder = scalar(params?.order) || scalar(params?.dir)
  const order = requestedOrder === 'asc' || requestedOrder === 'desc' ? requestedOrder : 'desc'
  const statusFilter = scalar(params?.status) === 'past' ? 'past' : 'active'
  const rawPage = scalar(params?.page)
  const requestedPage = typeof rawPage === 'string' && /^\d+$/.test(rawPage)
    ? Math.max(1, Number(rawPage))
    : 1
  const allOrders = getOrdersForUser(session.id)
  const filtered = allOrders.filter((order) => {
    const status = getOrderStatus(order)
    const past = ['Delivered', 'Cancelled'].includes(status)
    return statusFilter === 'past' ? past : !past
  })

  const valueFor = (orderRecord) => {
    if (sort === 'total') return Number(orderRecord.total) || 0
    if (sort === 'status') return getOrderStatus(orderRecord).toLowerCase()
    if (sort === 'neighborhood') return String(orderRecord.neighborhood || 'Not provided').toLowerCase()
    return new Date(orderRecord.createdAt || orderRecord.date).getTime() || 0
  }

  const sorted = filtered.map((orderRecord, index) => ({ orderRecord, index }))
  sorted.sort((left, right) => {
    const first = valueFor(left.orderRecord)
    const second = valueFor(right.orderRecord)
    const result = typeof first === 'string' ? first.localeCompare(second) : first - second
    return result === 0 ? left.index - right.index : order === 'asc' ? result : -result
  })
  const ordered = sorted.map(({ orderRecord }) => orderRecord)

  const pageCount = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount)
  const orders = ordered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return <div className="page-wrap container">
    <div className="page-title">
      <p className="eyebrow">ORDER HISTORY</p>
      <h1>My Orders</h1>
      <p>View and track your recent orders.</p>
    </div>
    <OrdersList orders={orders} exportOrders={allOrders} page={page} pageCount={pageCount} sort={sort} order={order} statusFilter={statusFilter} totalCount={ordered.length} hasAnyOrders={allOrders.length > 0} />
  </div>
}
