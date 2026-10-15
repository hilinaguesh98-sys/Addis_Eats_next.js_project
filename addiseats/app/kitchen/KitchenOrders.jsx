'use client'

import { useEffect, useState, useTransition } from 'react'
import { getOrderStatus } from '../../lib/order-statuses'
import { updateOrderStatus } from '../actions'
import { etb, when } from '../../lib/format'

export default function KitchenOrders({ orders: initialOrders }) {
  const [orders, setOrders] = useState(initialOrders)
  const [pendingOrder, setPendingOrder] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function changeStatus(orderId, status) {
    setError('')
    setPendingOrder(orderId)
    startTransition(async () => {
      try {
        const result = await updateOrderStatus(orderId, status)
        if (result.error) {
          setError(result.error)
          return
        }
        if (!result.order) {
          setError('The server did not return the updated order. Please refresh and try again.')
          return
        }
        setOrders((currentOrders) => currentOrders.map((order) => order.id === result.order.id ? result.order : order))
      } catch {
        setError('The order status could not be updated. Please try again.')
      } finally {
        setPendingOrder('')
      }
    })
  }

  if (!orders.length) return <div className="empty"><h2>No orders yet</h2></div>

  return <>
    {error ? <p className="error-box" role="alert">{error}</p> : null}
    {orders.map((order) => {
      const status = getOrderStatus(order)
      return <section className="order-status-panel" key={order.id}>
      <div className="order-status-heading">
        <div><span>Order #{order.id}</span><h2>{status}</h2><span>Updated {when(order.updatedAt)} (EAT)</span></div>
        <strong>{etb(order.total)}</strong>
      </div>
      <p>{order.items.map((item) => `${item.qty} × ${item.name}`).join(', ')}</p>
      <p className="order-updated">{[order.name, order.phone, order.neighborhood || 'Neighbourhood not provided', order.address].filter(Boolean).join(' · ')}</p>
      {!['Delivered', 'Cancelled'].includes(status) && <button
        className="checkout-button"
        type="button"
        disabled={isPending && pendingOrder === order.id}
        onClick={() => changeStatus(order.id, 'Cancelled')}
        aria-label={`Cancel order ${order.id}`}
      >
        {isPending && pendingOrder === order.id ? 'Cancelling…' : 'Cancel order'}
      </button>}
    </section>
    })}
  </>
}
