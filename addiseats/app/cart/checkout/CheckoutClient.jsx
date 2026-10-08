'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dishes } from '../../../lib/data'
import { placeOrder } from '../../actions'

export default function CheckoutClient() {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [form, setForm] = useState({ name:'', phone:'', address:'' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('addisEatsCart') || '[]')) } catch { setCart([]) }
  }, [])

  const rows = cart.map((item) => ({ ...item, dish:dishes.find((dish) => dish.id === item.id) })).filter((row) => row.dish)
  const subtotal = useMemo(() => rows.reduce((sum, row) => sum + row.dish.price * row.qty, 0), [rows])
  const total = subtotal + (rows.length ? 80 : 0)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setPending(true)
    const result = await placeOrder({ ...form, items:cart })
    if (result.error) { setError(result.error); setPending(false); return }
    localStorage.removeItem('addisEatsCart')
    window.dispatchEvent(new Event('addis-cart-updated'))
    router.push(`/order-confirmation/${result.order.id}`)
  }

  if (!rows.length) return <div className="page-wrap container"><div className="empty"><h2>Your cart is empty</h2><Link className="orange-button" href="/menu">Browse Menu</Link></div></div>

  return <div className="page-wrap container"><div className="page-title"><p className="eyebrow">CHECKOUT</p><h1>Complete Your Order</h1><p>Enter your delivery details and we'll take care of the rest.</p></div><div className="checkout"><form className="checkout-form" onSubmit={submit}><h2>Delivery Information</h2>{error && <div className="error-box">{error}</div>}<label>Full Name<input value={form.name} onChange={(event) => setForm({ ...form, name:event.target.value })} placeholder="Your full name" required/></label><label>Phone Number<input value={form.phone} onChange={(event) => setForm({ ...form, phone:event.target.value })} placeholder="0953168499" required/></label><label>Delivery Address<textarea value={form.address} onChange={(event) => setForm({ ...form, address:event.target.value })} placeholder="Street, neighborhood, landmark" required/></label><button className="checkout-button full" disabled={pending}>{pending ? 'Placing Order' : `Place Order · ${total.toLocaleString()} ETB`}</button></form><aside className="checkout-note"><p className="eyebrow">ORDER TOTAL</p><h2>{total.toLocaleString()} ETB</h2>{rows.map((row) => <div className="checkout-item" key={row.id}><span>{row.qty}× {row.dish.name}</span><b>{(row.dish.price * row.qty).toLocaleString()} ETB</b></div>)}<div className="checkout-item"><span>Delivery</span><b>80 ETB</b></div><Link href="/cart" className="continue">← Back to Cart</Link></aside></div></div>
}
