'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import DishCard from '../components/DishCard'
import { categories, dishes } from '../lib/data'
import heroImage from './assets/photo_2026-09-09_10-50-26.jpg'

export default function HomeClient() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  const popular = useMemo(() => dishes.filter((dish) => dish.tag === 'Popular'), [])
  const filtered = useMemo(() => dishes.filter((dish) => {
    const matchesCategory = category === 'all' || dish.category === category
    const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  }).slice(0, 4), [category, search])

  return <>
    <section className="hero">
      <Image src={heroImage} alt="Burgers and fries ready to serve" fill priority fetchPriority="high" sizes="100vw" className="hero-image"/>
      <div className="hero-overlay">
        <div className="container hero-content">
          <p className="hero-kicker">AUTHENTIC FLAVORS · FAST DELIVERY</p>
          <h1>Hungry? We've got<br/>you covered.</h1>
          <p className="hero-copy">Delicious Ethiopian and international dishes from your<br/>favorite local restaurants delivered straight to your door.</p>
          <div className="search-box">
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for dishes..." />
            <button type="button" onClick={() => document.getElementById('popular')?.scrollIntoView({ behavior: 'smooth' })}>Find Food</button>
          </div>
        </div>
      </div>
    </section>

    <section className="home-section container">
      <p className="eyebrow">FIND YOUR FAVORITE</p>
      <h3 className="craving">What are you craving?</h3>
      <div className="chips">
        {categories.map((item) => <button key={item.id} className={category === item.id ? 'selected' : ''} onClick={() => setCategory(item.id)}>{item.label}</button>)}
      </div>

      <div id="popular" className="section-heading"><div><p className="eyebrow">CUSTOMER FAVORITES</p><h2>Popular Right Now</h2></div><Link href="/menu">View All Menu →</Link></div>
      <div className="dish-grid">{(search || category !== 'all' ? filtered : popular.slice(0, 4)).map((dish) => <DishCard key={dish.id} dish={dish} />)}</div>
    </section>
  </>
}
