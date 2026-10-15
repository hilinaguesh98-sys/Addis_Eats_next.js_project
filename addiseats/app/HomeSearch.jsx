'use client'

import { useState } from 'react'

export default function HomeSearch() {
  const [search, setSearch] = useState('')

  const updateSearch = (value) => {
    setSearch(value)
    window.dispatchEvent(new CustomEvent('addis-home-search', { detail: value }))
  }

  return <div className="search-box">
    <span aria-hidden="true">⌕</span>
    <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search for dishes..." aria-label="Search dishes on the home page" />
    <button type="button" onClick={() => document.getElementById('popular')?.scrollIntoView({ behavior: 'smooth' })}>Find Food</button>
  </div>
}
