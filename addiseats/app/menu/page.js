import { categories, dishes } from '../../lib/data'
import { getMenuPage, MENU_PAGE_SIZE } from '../../lib/menu'
import { createOpenGraphMetadata } from '../../lib/site'
import SearchBox from './SearchBox'

export const metadata = {
  title: 'Browse the Menu',
  description: 'Explore Ethiopian dishes, pizza, burgers, sides, and drinks. Filter by category and find your next Addis Eats favorite.',
  openGraph: createOpenGraphMetadata(
    'Browse the Menu | AddisEats',
    'Explore Ethiopian dishes, pizza, burgers, sides, and drinks. Filter by category and find your next Addis Eats favorite.',
    '/menu'
  ),
}

export default async function MenuPage({ searchParams }) {
  const params = await searchParams
  const validCategory = categories.some((item) => item.id === params.category)
  const category = validCategory ? params.category : 'all'
  const search = typeof params.q === 'string' ? params.q.trim() : ''
  const sort = ['popular', 'low', 'high'].includes(params.sort) ? params.sort : 'popular'
  const page = Number.parseInt(params.page || '1', 10) || 1
  const initialData = getMenuPage({ search, category, sort, page, pageSize: MENU_PAGE_SIZE })
  const allDishes = dishes

  return <SearchBox
    categories={categories}
    initialCategory={category}
    initialData={initialData}
    initialSearch={search}
    initialSort={sort}
    allDishes={allDishes}
  />
}
