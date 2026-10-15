'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { fetcher } from '../../../lib/fetcher'
import { getOrderStatus } from '../../../lib/order-statuses'
import { etb, when } from '../../../lib/format'

export default function OrderStatus({ initialOrder }) {
  const { data, error } = useSWR(`/api/orders/${initialOrder.id}`, fetcher, {
    fallbackData: { order: initialOrder },
    refreshInterval: 10000,
    refreshWhenHidden: true,
    revalidateOnFocus: false,
    dedupingInterval: 1000
  })
  const order = data?.order || initialOrder
  const status = getOrderStatus(order)

  return <div className="page-wrap container">
    <Link className="back" href="/orders">← All orders</Link>
    <div className="order-status-page">
      <div className="page-title"><p className="eyebrow">ORDER TRACKING</p><h1>Order #{order.id}</h1><p>Track your meal as it moves through the kitchen.</p><Link className="orange-button" href={`/track/${encodeURIComponent(order.id)}`}>Live delivery map</Link></div>
      {error ? <p className="muted" role="status">Live updates are temporarily unavailable. Showing the latest saved status.</p> : null}
      <section className="order-status-panel" aria-live="polite">
        <div className="order-status-heading"><div><span>Current status</span><h2>{status}</h2></div><span className="status">{status}</span></div>
        <div className="order-status-progress"><span className={status === 'Preparing' ? 'current' : 'complete'}>Received</span><span className={status === 'Preparing' ? 'current' : status === 'On the way' || status === 'Delivered' ? 'complete' : ''}>Preparing</span><span className={status === 'On the way' ? 'current' : status === 'Delivered' ? 'complete' : ''}>On the way</span><span className={status === 'Delivered' ? 'current' : ''}>Delivered</span></div>
        <p className="order-updated">Last updated {when(order.updatedAt || order.createdAt)} (EAT)</p>
        <ol className="tracking-status-history" aria-label="Order status timeline">
          {(order.statusHistory || []).map((entry, index) => <li key={`${entry.status}-${entry.updatedAt}-${index}`}><strong>{entry.status}</strong><time dateTime={entry.updatedAt}>{when(entry.updatedAt)} (EAT)</time></li>)}
        </ol>
      </section>
      <section className="order-status-panel">
        <h2>Order details</h2>
        <div className="tracking-items">{order.items.map((item) => <div className="tracking-item" key={item.id}><span>{item.qty} × {item.name}</span><strong>{etb(item.price * item.qty)}</strong></div>)}</div>
        <div className="tracking-total"><span>Total</span><strong>{etb(order.total)}</strong></div>
        <p className="order-updated">Delivering to {order.neighborhood || 'the selected delivery area'}</p><p className="order-updated">Order placed {when(order.createdAt || order.date)}</p>
      </section>
    </div>
  </div>
}
