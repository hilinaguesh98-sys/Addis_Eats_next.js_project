'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import DishCard from '../../components/DishCard'
import { fetcher } from '../../lib/fetcher'
import { MENU_PAGE_SIZE, MENU_POPULAR_ORDER } from '../../lib/menu'

const PAGE_SIZE = MENU_PAGE_SIZE

function updateQuery({ search, category, sort, page }) {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  if (category !== 'all') params.set('category', category)
  if (sort !== 'popular') params.set('sort', sort)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  window.history.replaceState(null, '', query ? `/menu?${query}` : '/menu')
}

export default function SearchBox({ categories, initialCategory, initialData, initialSearch, initialSort, allDishes }) {
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState(initialSort)
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [page, setPage] = useState(initialData.page)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextSearch = search.trim()
      if (nextSearch !== debouncedSearch) {
        setDebouncedSearch(nextSearch)
        setPage(1)
        updateQuery({ search: nextSearch, category, sort, page: 1 })
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, debouncedSearch, category, sort])

  const key = debouncedSearch
    ? ['/api/dishes', debouncedSearch, category, sort, page]
    : null
  const { data, error } = useSWR(key, fetcher, {
    fallbackData: initialSearch ? initialData : undefined,
    keepPreviousData: true,
    revalidateOnMount: true,
    dedupingInterval: 2000,
    revalidateOnFocus: false
  })

  let localDishes = allDishes.filter((dish) => category === 'all' || dish.category === category)
  if (sort === 'popular') {
    localDishes = [...localDishes].sort((a, b) => {
      const aRank = MENU_POPULAR_ORDER.indexOf(a.id)
      const bRank = MENU_POPULAR_ORDER.indexOf(b.id)
      return (aRank < 0 ? MENU_POPULAR_ORDER.length : aRank) - (bRank < 0 ? MENU_POPULAR_ORDER.length : bRank)
    })
  }
  if (sort === 'low') localDishes = [...localDishes].sort((a, b) => a.price - b.price)
  if (sort === 'high') localDishes = [...localDishes].sort((a, b) => b.price - a.price)
  const localTotalPages = Math.max(1, Math.ceil(localDishes.length / PAGE_SIZE))
  const localData = {
    dishes: localDishes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: localDishes.length,
    page,
    totalPages: localTotalPages
  }
  const result = debouncedSearch ? data : localData

  function changeCategory(nextCategory) {
    setCategory(nextCategory)
    setPage(1)
    updateQuery({ search: debouncedSearch, category: nextCategory, sort, page: 1 })
  }

  function changeSort(event) {
    const nextSort = event.target.value
    setSort(nextSort)
    setPage(1)
    updateQuery({ search: debouncedSearch, category, sort: nextSort, page: 1 })
  }

  function changePage(nextPage) {
    setPage(nextPage)
    updateQuery({ search: debouncedSearch, category, sort, page: nextPage })
  }

  function submitSearch() {
    const nextSearch = search.trim()
    setDebouncedSearch(nextSearch)
    setPage(1)
    updateQuery({ search: nextSearch, category, sort, page: 1 })
  }

  return <div className="page-wrap container menu-page">
    <h1 className="sr-only">Our Menu</h1>
    <label className="menu-search menu-search-wide"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch() }} placeholder="Search for dishes" aria-label="Search dishes"/><button type="button" onClick={submitSearch}>Search</button></label>
    <div className="menu-layout">
      <aside className="category-box" aria-label="Menu categories"><h2>Categories</h2>{categories.map((item) => <button type="button" key={item.id} className={category === item.id ? 'cat-active' : ''} aria-pressed={category === item.id} onClick={() => changeCategory(item.id)}><span aria-hidden="true">{({ all: '', ethiopian: '', pizza: '', burgers: '', sides: '', drinks: '' })[item.id]}</span>{item.label}</button>)}</aside>
      <section>
        <div className="menu-toolbar"><h2>Popular Dishes</h2><div className="menu-toolbar-actions"><label className="sort-area" htmlFor="menu-sort">Sort<select id="menu-sort" value={sort} onChange={changeSort} aria-label="Sort dishes"><option value="popular">Popular</option><option value="low">Price: Low</option><option value="high">Price: High</option></select></label><Link href="/menu?category=all">View All Menu →</Link></div></div>
        {error ? <div className="error-box" role="alert">Menu results could not be loaded. Please try again.</div> : null}
        {result?.dishes.length ? <div className="dish-grid menu-grid">{result.dishes.map((dish, index) => <DishCard key={dish.id} dish={dish} variant="menu" priority={index === 0} sizes="(max-width: 600px) 44vw, (max-width: 850px) 20vw, (max-width: 1420px) 19vw, 300px"/>)}</div> : <div className="empty"><div className="empty-icon">⌕</div><h2>No dishes found</h2><p className="muted">Try another category or search term.</p></div>}
        {result?.total > PAGE_SIZE ? <nav className="menu-pagination" aria-label="Menu pages"><button type="button" onClick={() => changePage(page - 1)} disabled={page <= 1}>‹&nbsp; Previous</button><span>{Array.from({ length: result.totalPages }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} className={pageNumber === page ? 'current' : ''} onClick={() => changePage(pageNumber)}>{pageNumber}</button>)}</span><button type="button" onClick={() => changePage(page + 1)} disabled={page >= result.totalPages}>Next&nbsp; ›</button></nav> : null}
      </section>
    </div>
  </div>
}