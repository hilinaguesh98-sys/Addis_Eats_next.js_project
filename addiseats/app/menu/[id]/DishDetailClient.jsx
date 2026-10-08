'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function DishDetailClient({ dish }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const add = () => {
    const cart = JSON.parse(localStorage.getItem('addisEatsCart') || '[]')
    const existing = cart.find((item) => item.id === dish.id)
    if (existing) existing.qty += qty
    else cart.push({ id:dish.id, qty })
    localStorage.setItem('addisEatsCart', JSON.stringify(cart))
    window.dispatchEvent(new Event('addis-cart-updated'))
    setAdded(true)
  }

  return <div className="page-wrap container">
    <Link className="back" href="/menu">← Back to Menu</Link>
    <div className="detail"><div className="detail-image">
      <Image src={dish.image} alt={dish.imageAlt} width={dish.image.width} height={dish.image.height} sizes="(max-width: 600px) 90vw, (max-width: 1200px) 43vw, 690px"/></div>
      <div className="detail-copy"><span className="category-pill">{dish.category}</span>
      <h1>{dish.name}</h1>
      <div className="rating">★ 4.8 <span>•</span> Customer favorite</div>
      <p>{dish.description}</p><div className="detail-price">{dish.price.toLocaleString()} ETB</div>
      <h4>Ingredients</h4>
      <div className="ingredients">{dish.ingredients.map((item) => <span className="ingredient" key={item}>{item}</span>)}</div>
      <div className="qty big"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
      <strong>{qty}</strong><button onClick={() => setQty(qty + 1)}>+</button></div>
      <button className="checkout-button full" onClick={add}>
        {added ? 'Added to Cart ✓' : `Add to Cart · ${(dish.price * qty).toLocaleString()} ETB`}</button>
        </div></div></div>
}
