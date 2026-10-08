'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import DishCard from '../../components/DishCard'
import { fetcher } from '../../lib/fetcher'

const PAGE_SIZE = 6

function updateQuery({ search, category, sort, page }) {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  if (category !== 'ethiopian') params.set('category', category)
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

  return <div className="page-wrap container">
    <div className="page-title"><p className="eyebrow">EXPLORE OUR MENU</p><h1>Our Menu</h1><p>Freshly prepared dishes inspired by Ethiopia and loved around Addis Ababa.</p></div>
    <div className="menu-layout">
      <aside className="category-box"><h4>CATEGORIES</h4>{categories.map((item) => <button key={item.id} className={category === item.id ? 'cat-active' : ''} onClick={() => changeCategory(item.id)}>{item.label}</button>)}</aside>
      <section>
        <div className="menu-toolbar"><label className="menu-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes..." aria-label="Search dishes"/></label><div className="sort-area"><span>{result?.total ?? 0} dishes</span><select value={sort} onChange={changeSort} aria-label="Sort dishes"><option value="popular">Sort: Popular</option><option value="low">Price: Low</option><option value="high">Price: High</option></select></div></div>
        {error ? <div className="error-box" role="alert">Menu results could not be loaded. Please try again.</div> : null}
        {result?.dishes.length ? <div className="dish-grid menu-grid">{result.dishes.map((dish) => <DishCard key={dish.id} dish={dish} sizes="(max-width: 420px) 90vw, (max-width: 600px) 44vw, (max-width: 850px) 40vw, (max-width: 1420px) 28vw, 432px"/>)}</div> : <div className="empty"><div className="empty-icon">⌕</div><h2>No dishes found</h2><p className="muted">Try another category or search term.</p></div>}
        {result?.total > PAGE_SIZE ? <nav className="menu-pagination" aria-label="Menu pages"><button type="button" onClick={() => changePage(page - 1)} disabled={page <= 1}>Previous</button><span>Page {result.page} of {result.totalPages}</span><button type="button" onClick={() => changePage(page + 1)} disabled={page >= result.totalPages}>Next</button></nav> : null}
      </section>
    </div>
  </div>
}