'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import DishCard from '../components/DishCard'
import { categories, dishes } from '../lib/data'

export default function HomeClient() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const onSearch = (event) => setSearch(event.detail)
    window.addEventListener('addis-home-search', onSearch)
    const currentSearch = document.querySelector('[aria-label="Search dishes on the home page"]')?.value
    if (currentSearch) setSearch(currentSearch)
    return () => window.removeEventListener('addis-home-search', onSearch)
  }, [])

  const popular = useMemo(() => ['item-2', 'item-3', 'item-4', 'item-5'].map((id) => dishes.find((dish) => dish.id === id)).filter(Boolean), [])
  const filtered = useMemo(() => dishes.filter((dish) => {
    const matchesCategory = category === 'all' || dish.category === category
    const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  }).slice(0, 4), [category, search])

  return <>
    <section className="home-section container">
      <h2 className="craving">What are you craving?</h2>
      <div className="chips">
        {categories.map((item) => <button type="button" key={item.id} className={category === item.id ? 'selected' : ''} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
      </div>

      <div id="popular" className="section-heading"><h2>Popular Dishes</h2><Link href="/menu">View All Menu →</Link></div>
      <div className="dish-grid home-grid">{(search || category !== 'all' ? filtered : popular).map((dish) => <DishCard key={dish.id} dish={dish} variant="home" />)}</div>
    </section>
  </>
}
