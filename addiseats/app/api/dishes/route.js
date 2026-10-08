import { NextResponse } from 'next/server'
import { categories } from '../../../lib/data'
import { getMenuPage, MENU_PAGE_SIZE } from '../../../lib/menu'

export async function GET(request) {
  const params = request.nextUrl.searchParams
  const category = params.get('category') || 'all'
  const sort = params.get('sort') || 'popular'
  const page = Number.parseInt(params.get('page') || '1', 10)
  const pageSize = Number.parseInt(params.get('pageSize') || String(MENU_PAGE_SIZE), 10)

  if (!categories.some((item) => item.id === category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }
  if (!['popular', 'low', 'high'].includes(sort)) {
    return NextResponse.json({ error: 'Invalid sort order' }, { status: 400 })
  }

  return NextResponse.json(getMenuPage({
    search: params.get('search') || '',
    category,
    sort,
    page,
    pageSize: Math.min(Math.max(pageSize || MENU_PAGE_SIZE, 1), 24)
  }))
}
