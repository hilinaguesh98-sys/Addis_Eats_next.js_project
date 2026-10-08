'use client'

import Link from 'next/link'

export default function OrderConfirmationClient({ initialOrder: order }) {
  return <div className="confirmation-wrap container"><div className="confirmation-card"><div className="check">✓</div><h1>Order Confirmed!</h1><p>Thank you for your order. We're preparing your delicious meal.</p><div className="confirmation-details"><div><span>Order Number</span><b>#{order.id}</b></div><div><span>Estimated Delivery Time</span><b>30–45 minutes</b></div><div><span>Total Amount Paid</span><b>{order.total.toLocaleString()} ETB</b></div></div><div className="confirmation-items"><h4>Items Ordered</h4>{order.items.map((item) => <div key={item.id}><span>{item.qty}× {item.name}</span><b>{(item.price * item.qty).toLocaleString()} ETB</b></div>)}</div><div className="confirmation-actions"><Link className="orange-button" href="/orders">Track Order</Link><Link className="outline-button" href="/menu">Back to Menu</Link></div></div></div>
}
