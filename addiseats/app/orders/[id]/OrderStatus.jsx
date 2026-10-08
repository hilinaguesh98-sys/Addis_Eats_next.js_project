'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '../../../lib/fetcher'
import { getOrderStatus } from '../../../lib/order-statuses'

export default function OrderStatus({ initialOrder }) {
  const [now, setNow] = useState(() => Date.now())
  const { data, error } = useSWR(`/api/orders/${initialOrder.id}`, fetcher, {
    fallbackData: { order: initialOrder },
    refreshInterval: 5000,
    refreshWhenHidden: true,
    revalidateOnFocus: false,
    dedupingInterval: 1000
  })
  const order = data?.order || initialOrder
  const status = getOrderStatus(order, now)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])

  return <div className="page-wrap container">
    <Link className="back" href="/orders">← All orders</Link>
    <div className="order-status-page">
      <div className="page-title"><p className="eyebrow">ORDER TRACKING</p><h1>Order #{order.id}</h1><p>Track your meal as it moves through the kitchen.</p></div>
      {error ? <p className="muted" role="status">Live updates are temporarily unavailable. Showing the latest saved status.</p> : null}
      <section className="order-status-panel" aria-live="polite">
        <div className="order-status-heading"><div><span>Current status</span><h2>{status}</h2></div><span className="status">{status}</span></div>
        <div className="order-status-progress"><span className={status === 'Preparing' ? 'current' : 'complete'}>Received</span><span className={status === 'Preparing' ? 'current' : status === 'On the way' || status === 'Delivered' ? 'complete' : ''}>Preparing</span><span className={status === 'On the way' ? 'current' : status === 'Delivered' ? 'complete' : ''}>On the way</span><span className={status === 'Delivered' ? 'current' : ''}>Delivered</span></div>
        <p className="order-updated">Status advances every 3 seconds: Preparing, On the way, then Delivered.</p>
      </section>
      <section className="order-status-panel">
        <h2>Order details</h2>
        <div className="tracking-items">{order.items.map((item) => <div className="tracking-item" key={item.id}><span>{item.qty} × {item.name}</span><strong>{(item.price * item.qty).toLocaleString()} ETB</strong></div>)}</div>
        <div className="tracking-total"><span>Total</span><strong>{order.total.toLocaleString()} ETB</strong></div>
        <p className="order-updated">Delivering to {order.address}</p>
      </section>
    </div>
  </div>
}