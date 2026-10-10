'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getOrderStatus } from '../../lib/order-statuses'

export default function OrdersList({ orders }) {
  const [tab, setTab] = useState('active')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])

  const visible = tab === 'active'
    ? orders.filter((order) => !['Delivered', 'Cancelled'].includes(getOrderStatus(order, now)))
    : orders.filter((order) => ['Delivered', 'Cancelled'].includes(getOrderStatus(order, now)))

  return <div className="page-wrap container">
    <div className="page-title orders-title">
      <div><p className="eyebrow">ORDER HISTORY</p>
      <h1>My Orders</h1>
      <p>View and track your recent orders.</p>
      </div><div className="order-tabs">
        <button className={tab === 'active' ? 'active' : ''}
         onClick={() => setTab('active')}>Active Orders</button>
         <button className={tab === 'past' ? 'active' : ''}
          onClick={() => setTab('past')}>Past Orders</button>
          </div></div>{visible.length ? visible.map((order) => 
          <div className="order-card" key={order.id}>
            <div className="order-head"><strong>Order {order.id}</strong>
            <span>Placed {order.date}</span>
            <b className="status">{getOrderStatus(order, now)}</b>
            </div><div className="order-body">
              <div className="order-products">
                {order.items.slice(0, 3).map((item) => <div className="mini-item" key={item.id}>
                  <span>{item.qty}×</span>
                  <Image src={item.image} alt={item.name} width={item.imageWidth} 
                  height={item.imageHeight} sizes="36px"/><span>{item.name}
                  </span></div>)}</div><div className="order-total">
                    <span>Total Amount</span><strong>
                      {order.total.toLocaleString()} ETB</strong>
                      </div></div><div className="order-foot">
                        <Link className="track-button" href={`/orders/${order.id}`}>Order Detail</Link></div>
                        </div>) : 
                        <div className="empty">
                          <div className="empty-icon"></div>
                          <h2>{tab === 'active' ? 'No active orders' : 'No past orders'}</h2>
                          <p className="muted"></p>
                          <Link className="orange-button" href="/menu">Order Food</Link></div>}</div>

}