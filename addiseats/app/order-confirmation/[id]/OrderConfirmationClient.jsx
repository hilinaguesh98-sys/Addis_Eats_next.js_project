'use client'

import Link from 'next/link'
import { etb, when } from '../../../lib/format'

export default function OrderConfirmationClient({ initialOrder: order }) {
  return <div className="confirmation-wrap container"><div className="confirmation-card"><div className="check" aria-hidden="true">✓</div><h1>Order Confirmed!</h1><p>Your order has been received. Follow staff-updated progress using the tracking link below.</p><div className="confirmation-details"><div><span>Order Number</span><b>#{order.id}</b></div><div><span>Current status</span><b>{order.status}</b></div><div><span>Order placed (EAT)</span><b>{when(order.createdAt)}</b></div><div><span>Order total</span><b>{etb(order.total)}</b></div></div><div className="confirmation-items"><h4>Items Ordered</h4>{order.items.map((item) => <div key={item.id}><span>{item.qty}× {item.name}</span><b>{etb(item.price * item.qty)}</b></div>)}</div><div className="confirmation-actions"><Link className="orange-button" href={`/track/${encodeURIComponent(order.id)}`}>Track Delivery</Link><Link className="outline-button" href="/menu">Back to Menu</Link></div></div></div>
}


