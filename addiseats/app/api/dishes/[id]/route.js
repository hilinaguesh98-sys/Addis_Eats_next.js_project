import { NextResponse } from 'next/server'
import { getDish, getImageUrl } from '../../../../lib/data'

export async function GET(request, { params }) {
  const { id } = await params
  const dish = getDish(id)
  if (!dish) return NextResponse.json({ error:'Dish not found' }, { status:404 })
  return NextResponse.json({ dish:{ ...dish, image:getImageUrl(dish.image) } })
}
