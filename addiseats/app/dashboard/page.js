import { redirect } from 'next/navigation'
import DashboardCharts from './RevenueChart'
import { getOrders } from '../../lib/orders'
import { getSession } from '../../lib/session'
import { etb } from '../../lib/format'
import { createOpenGraphMetadata } from '../../lib/site'

const title = 'Sales Dashboard'
const description = 'Staff reporting for Addis Eats order revenue and neighbourhood activity.'
export const dynamic = 'force-dynamic'
export const metadata = {
  title,
  description,
  openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, '/dashboard'),
  robots: { index: false, follow: false },
}

const TIME_ZONE = 'Africa/Addis_Ababa'
const dateParts = new Intl.DateTimeFormat('en', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const dayLabel = new Intl.DateTimeFormat('en-ET', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

function dateKey(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const parts = Object.fromEntries(dateParts.formatToParts(date).map(({ type, value: part }) => [type, part]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

function summarizeOrders(orders, now = new Date()) {
  const todayKey = dateKey(now)
  const [year, month, day] = todayKey.split('-').map(Number)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - (6 - index)))
    const key = date.toISOString().slice(0, 10)
    return {
      date: key,
      label: dayLabel.format(new Date(`${key}T12:00:00Z`)),
      orders: 0,
    }
  })
  const dailyByDate = new Map(days.map((entry) => [entry.date, entry]))
  const revenueByNeighborhood = new Map()

  for (const order of orders) {
    const dailyEntry = dailyByDate.get(dateKey(order.createdAt))
    if (dailyEntry) dailyEntry.orders += 1

    if (order.status === 'Cancelled') continue
    const neighborhood = String(order.neighborhood || '').trim() || 'Not provided'
    const total = Number(order.total)
    if (Number.isFinite(total)) {
      revenueByNeighborhood.set(neighborhood, (revenueByNeighborhood.get(neighborhood) || 0) + total)
    }
  }

  return {
    revenueData: [...revenueByNeighborhood.entries()]
      .map(([neighborhood, revenue]) => ({ neighborhood, revenue }))
      .sort((left, right) => left.neighborhood.localeCompare(right.neighborhood)),
    dailyData: days,
    orderCount: orders.length,
    revenueTotal: [...revenueByNeighborhood.values()].reduce((sum, revenue) => sum + revenue, 0),
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/signin?next=%2Fdashboard')
  if (session.role !== 'staff') redirect('/orders')

  const summary = summarizeOrders(getOrders())

  return <div className="page-wrap container dashboard-page">
    <div className="page-title">
      <p className="eyebrow">STAFF ONLY</p>
      <h1>Addis Eats dashboard</h1>
      <p>Order activity and neighbourhood revenue. Revenue excludes cancelled orders.</p>
    </div>
    {summary.orderCount === 0
      ? <section className="dashboard-empty" role="status"><h2>No order data yet</h2><p>Dashboard charts will appear when customers place orders.</p></section>
      : <>
        <section className="dashboard-summary" aria-label="Order summary">
          <div><span>Total orders</span><strong>{summary.orderCount.toLocaleString('en-ET')}</strong></div>
          <div><span>Revenue (excluding cancelled orders)</span><strong>{etb(summary.revenueTotal)}</strong></div>
        </section>
        <DashboardCharts revenueData={summary.revenueData} dailyData={summary.dailyData} />
      </>}
  </div>
}
