'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dishes } from '../../../lib/data'
import { DELIVERY_ORIGIN, DELIVERY_LOCATIONS } from '../../../lib/delivery-locations'
import { placeOrder } from '../../actions'

export default function CheckoutClient() {
  const router = useRouter()
  const submitGuard = useRef(false)
  const requestRef = useRef(null)
  const [cart, setCart] = useState([])
  const [form, setForm] = useState({ name:'', phone:'', neighborhood:'' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('addisEatsCart') || '[]')) } catch { setCart([]) }
  }, [])

  const rows = cart.map((item) => ({ ...item, dish:dishes.find((dish) => dish.id === item.id) })).filter((row) => row.dish)
  const subtotal = useMemo(() => rows.reduce((sum, row) => sum + row.dish.price * row.qty, 0), [rows])
  const total = subtotal + (rows.length ? 80 : 0)
  const deliveryLocation = DELIVERY_LOCATIONS.find((location) => location.name === form.neighborhood)

  const submit = async (event) => {
    event.preventDefault()
    if (submitGuard.current) return
    submitGuard.current = true
    setError('')
    setPending(true)
    const input = { ...form, items: cart }
    const signature = JSON.stringify(input)
    try {
      let key
      try {
        const stored = JSON.parse(sessionStorage.getItem('addisEatsOrderRequest') || 'null')
        if (stored?.signature === signature && typeof stored.key === 'string') key = stored.key
      } catch {
        key = null
      }
      if (!key && requestRef.current?.signature === signature) key = requestRef.current.key
      if (!key) {
        key = crypto.randomUUID()
        requestRef.current = { signature, key }
        try {
          sessionStorage.setItem('addisEatsOrderRequest', JSON.stringify({ signature, key }))
        } catch {
          requestRef.current = { signature, key }
        }
      }

      const result = await placeOrder(input, key)
      if (result.error) {
        setError(result.error)
        return
      }
      setError('')
      try {
        sessionStorage.removeItem('addisEatsOrderRequest')
      } catch {}
      requestRef.current = null
      try {
        localStorage.removeItem('addisEatsCart')
      } catch {
        setError('Order placed. The cart could not be cleared in this browser; check your order history before trying again.')
      }
      window.dispatchEvent(new Event('addis-cart-updated'))
      router.push(`/order-confirmation/${result.order.id}`)
    } catch {
      setError('We could not confirm the order request. Please retry; the same request key will prevent a duplicate order.')
    } finally {
      setPending(false)
      submitGuard.current = false
    }
  }

  if (!rows.length) return <div className="page-wrap container"><div className="empty"><h2>Your cart is empty</h2><Link className="orange-button" href="/menu">Browse Menu</Link></div></div>

  return <div className="page-wrap container">
    <div className="page-title"><p className="eyebrow">CHECKOUT</p><h1>Complete Your Order</h1><p>Enter your delivery details and we'll take care of the rest.</p></div>
    <div className="checkout">
      <form className="checkout-form" onSubmit={submit}>
        <h2>Delivery Information</h2>
        {error && <div className="error-box" role="alert">{error}</div>}
        <label>Full Name<input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name:event.target.value })} placeholder="Your full name" required/></label>
        <label>Phone Number<input autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone:event.target.value })} placeholder="0953168499" required/></label>
        <label>Delivery Area
          <select value={form.neighborhood} onChange={(event) => setForm({ ...form, neighborhood:event.target.value })} required>
            <option value="">Choose your area</option>
            {DELIVERY_LOCATIONS.map((location) => <option key={location.name} value={location.name}>{location.name}</option>)}
          </select>
        </label>
        <div className="checkout-route" aria-live="polite">
          <span>Route</span>
          <strong>{DELIVERY_ORIGIN.name} <span aria-hidden="true">→</span> {deliveryLocation?.name || 'Choose a delivery area'}</strong>
          <small>Area-level route preview; the pin marks an approximate neighbourhood centre.</small>
        </div>
        <button className="checkout-button full" type="submit" disabled={pending}>{pending ? 'Placing Order…' : `Place Order · ${total.toLocaleString()} ETB`}</button>
      </form>
      <aside className="checkout-note">
        <p className="eyebrow">ORDER TOTAL</p><h2>{total.toLocaleString()} ETB</h2>
        {rows.map((row) => <div className="checkout-item" key={row.id}><span>{row.qty}× {row.dish.name}</span><b>{(row.dish.price * row.qty).toLocaleString()} ETB</b></div>)}
        <div className="checkout-item"><span>Delivery</span><b>80 ETB</b></div>
        <Link href="/cart" className="continue">← Back to Cart</Link>
      </aside>
    </div>
  </div>
}
