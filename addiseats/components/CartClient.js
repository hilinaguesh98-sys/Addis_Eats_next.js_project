'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { dishes } from '../lib/data'

export default function CartClient() {
  const [cart, setCart] = useState([])
  const load = () => {
    try { setCart(JSON.parse(localStorage.getItem('addisEatsCart') || '[]')) } catch { setCart([]) }
  }
  useEffect(() => {
    load()
    window.addEventListener('addis-cart-updated', load)
    return () => window.removeEventListener('addis-cart-updated', load)
  }, [])
  const rows = cart.map((item) => ({ ...item, dish: dishes.find((dish) => dish.id === item.id) })).filter((row) => row.dish)
  const subtotal = useMemo(() => rows.reduce((sum, row) => sum + row.dish.price * row.qty, 0), [rows])
  const delivery = rows.length ? 80 : 0
  const total = subtotal + delivery
  const update = (id, qty) => {
    const next = cart.map((item) => item.id === id ? { ...item, qty } : item).filter((item) => item.qty > 0)
    localStorage.setItem('addisEatsCart', JSON.stringify(next))
    setCart(next)
    window.dispatchEvent(new Event('addis-cart-updated'))
  }
  if (!rows.length) return <div className="empty cart-empty"><div className="empty-icon"></div><h2>Your cart is empty</h2><p className="muted">Add something delicious from the menu.</p><Link className="orange-button" href="/menu">Browse Menu</Link></div>
  return <div className="cart-layout">
    <section className="cart-main">
      <div className="section-title-row"><div>
        <p className="eyebrow">READY TO ORDER?</p>
        <h1>Your Cart</h1>
        </div><span>{rows.reduce((sum, row) => sum + row.qty, 0)}
           items</span>
           </div><div className="cart-list">{rows.map(({ dish, qty }) =>
            <div className="cart-row" key={dish.id}><Image src={dish.image} alt={dish.imageAlt} width={dish.image.width} height={dish.image.height} sizes="65px" style={{ width:65, height:58, objectFit:'cover' }}/>
            <div className="cart-copy"><strong>{dish.name}</strong>
            <span>{dish.category}</span>
            <b>{dish.price.toLocaleString()} ETB</b></div><div className="qty">
              <button type="button" onClick={() => update(dish.id, qty - 1)} aria-label={`Decrease ${dish.name} quantity`}>−</button>
              <span aria-live="polite">{qty}</span><button type="button" onClick={() => update(dish.id, qty + 1)} aria-label={`Increase ${dish.name} quantity`}>+</button></div>
              <button type="button" className="remove-item" onClick={() => update(dish.id, 0)} aria-label={`Remove ${dish.name}`}>×</button></div>)}
              </div><Link href="/menu" className="continue">← Continue Shopping</Link></section><aside className="summary-card">
                <p className="eyebrow">YOUR ORDER</p>
                <h2>Order Summary</h2><div className="summary-line">
                  <span>Subtotal</span><b>{subtotal.toLocaleString()} ETB</b>
                  </div><div className="summary-line"><span>Delivery Fee</span>
                  <b>{delivery} ETB</b></div><div className="summary-total">
                    <span>Total</span><b>{total.toLocaleString()} ETB</b></div>
                    <Link href="/cart/checkout" className="checkout-button">Proceed to Checkout</Link>
                    </aside></div>
}
