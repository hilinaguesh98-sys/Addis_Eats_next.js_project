import { dishes } from './data'

export const MENU_PAGE_SIZE = 6

export function getMenuPage({ search = '', category = 'all', sort = 'popular', page = 1, pageSize = MENU_PAGE_SIZE } = {}) {
  let results = dishes
  const normalizedSearch = search.trim().toLowerCase()

  if (normalizedSearch) {
    results = results.filter((dish) => dish.name.toLowerCase().includes(normalizedSearch))
  }
  if (category !== 'all') results = results.filter((dish) => dish.category === category)
  if (sort === 'low') results = [...results].sort((a, b) => a.price - b.price)
  if (sort === 'high') results = [...results].sort((a, b) => b.price - a.price)

  const total = results.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), totalPages)
  const start = (currentPage - 1) * pageSize

  return {
    dishes: results.slice(start, start + pageSize),
    total,
    page: currentPage,
    pageSize,
    totalPages
  }
}