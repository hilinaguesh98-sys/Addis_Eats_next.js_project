'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DishCard from '../../components/DishCard'
import { dishes } from '../../lib/data'

export default function FavoritesClient() {
  const [ids, setIds] = useState([])
  useEffect(() => {
    const load = () => {
      try { setIds(JSON.parse(localStorage.getItem('addisEatsFavorites') || '[]')) } catch { setIds([]) }
    }
    load()
    window.addEventListener('addis-favorites-updated', load)
    window.addEventListener('storage', load)
    return () => { window.removeEventListener('addis-favorites-updated', load); window.removeEventListener('storage', load) }
  }, [])
  const list = dishes.filter((dish) => ids.includes(dish.id))
  return <div className="page-wrap container"><div className="page-title"><p className="eyebrow">SAVED FOR LATER</p>
  <h1>My Favorites</h1><p>Your absolute favorite meals saved in one convenient place for easy reordering.</p>
  </div>{list.length ? <div className="dish-grid">{list.map((dish) => <DishCard key={dish.id} dish={dish}/>)}</div> 
  : <div className="empty"><div className="empty-icon">🤍</div><h2>No favorites yet</h2>
  <p className="muted">Tap the heart on a dish to save it here.</p>
  <Link className="orange-button" href="/menu">Browse Menu</Link></div>}</div>
}
