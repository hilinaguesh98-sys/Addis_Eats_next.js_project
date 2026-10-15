'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function DishCard({ dish, priority = false, variant = 'default', sizes = '(max-width: 850px) 44vw, (max-width: 1420px) 22vw, 340px' }) {
  const [favorite, setFavorite] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const readList = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]')
      return Array.isArray(value) ? value : []
    } catch {
      return []
    }
  }

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
    try {
      const ids = readList('addisEatsFavorites')
      const next = ids.includes(dish.id) ? ids.filter((id) => id !== dish.id) : [...ids, dish.id]
      localStorage.setItem('addisEatsFavorites', JSON.stringify(next))
      setFavorite(next.includes(dish.id))
      setAnnouncement(next.includes(dish.id) ? `${dish.name} added to favorites.` : `${dish.name} removed from favorites.`)
      window.dispatchEvent(new Event('addis-favorites-updated'))
    } catch {
      setAnnouncement('Favorites could not be updated in this browser.')
    }
  }

  const addToCart = (event) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      const cart = readList('addisEatsCart')
      const existing = cart.find((item) => item.id === dish.id)
      if (existing) existing.qty += 1
      else cart.push({ id: dish.id, qty: 1 })
      localStorage.setItem('addisEatsCart', JSON.stringify(cart))
      setAnnouncement(`${dish.name} added to cart.`)
      window.dispatchEvent(new Event('addis-cart-updated'))
    } catch {
      setAnnouncement('The cart could not be updated in this browser.')
    }
  }

  const categoryLabel = {
    ethiopian: 'Ethiopian',
    pizza: 'Pizza',
    burgers: 'Burgers',
    sides: 'Sides',
    drinks: 'Drinks',
  }[dish.category] || dish.category

  return (
    <article className={`dish-card dish-card-${variant}`}>
      <div className="dish-image">
        <Link href={`/menu/${dish.id}`} aria-label={`View ${dish.name}`}>
          <Image src={dish.image} alt={dish.imageAlt || dish.name} width={dish.image.width} height={dish.image.height} quality={65} sizes={sizes} priority={priority}/>
        </Link>
        {variant === 'default' && dish.tag && <span className="dish-tag">{dish.tag}</span>}
        <button type="button" className={`heart ${favorite ? 'liked' : ''}`} onClick={toggleFavorite} aria-label={favorite ? `Remove ${dish.name} from favorites` : `Add ${dish.name} to favorites`} aria-pressed={favorite}>{favorite ? ' 🖤' : '🤍'}</button>
      </div>
      <Link href={`/menu/${dish.id}`} className="dish-info">
        <div className="dish-title"><strong>{dish.name}</strong>{variant === 'default' && <span>4.8 ★</span>}</div>
        {variant === 'home' || variant === 'menu' ? <div className="dish-description">{categoryLabel}</div> : variant === 'default' ? <div className="dish-description">{dish.description}</div> : null}
      </Link>
      <div className="dish-bottom"><strong>{dish.price.toLocaleString()} ETB</strong>{variant === 'home' ? <Link href={`/menu/${dish.id}`}>View dish</Link> : <button type="button" onClick={addToCart}>Add to Cart</button>}</div>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </article>
  )
}
