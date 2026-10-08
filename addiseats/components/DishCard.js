'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function DishCard({ dish, sizes = '(max-width: 420px) 90vw, (max-width: 850px) 44vw, (max-width: 1420px) 22vw, 340px' }) {
  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('addisEatsFavorites') || '[]')
      setFavorite(ids.includes(dish.id))
    } catch {
      setFavorite(false)
    }
  }, [dish.id])

  const toggleFavorite = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const ids = JSON.parse(localStorage.getItem('addisEatsFavorites') || '[]')
    const next = ids.includes(dish.id) ? ids.filter((id) => id !== dish.id) : [...ids, dish.id]
    localStorage.setItem('addisEatsFavorites', JSON.stringify(next))
    setFavorite(next.includes(dish.id))
    window.dispatchEvent(new Event('addis-favorites-updated'))
  }

  const addToCart = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const cart = JSON.parse(localStorage.getItem('addisEatsCart') || '[]')
    const existing = cart.find((item) => item.id === dish.id)
    if (existing) existing.qty += 1
    else cart.push({ id: dish.id, qty: 1 })
    localStorage.setItem('addisEatsCart', JSON.stringify(cart))
    window.dispatchEvent(new Event('addis-cart-updated'))
  }

  return (
    <Link href={`/menu/${dish.id}`} className="dish-card">
      <div className="dish-image">
        <Image src={dish.image} alt={dish.imageAlt || dish.name} width={dish.image.width} height={dish.image.height} sizes={sizes}/>
        {dish.tag && <span className="dish-tag">{dish.tag}</span>}
        <button type="button" className={`heart ${favorite ? 'liked' : ''}`} onClick={toggleFavorite} aria-label={favorite ? 'Remove favorite' : 'Add favorite'}>{favorite ? '♥' : '♡'}</button>
      </div>
      <div className="dish-info">
        <div className="dish-title"><strong>{dish.name}</strong><span>4.8 ★</span></div>
        <div className="dish-description">{dish.description}</div>
        <div className="dish-bottom"><strong>{dish.price.toLocaleString()} ETB</strong><button type="button" onClick={addToCart}>Add to Cart</button></div>
      </div>
    </Link>
  )
}
