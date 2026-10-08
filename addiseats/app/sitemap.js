import { dishes, getImageUrl } from '../lib/data'
import { absoluteUrl } from '../lib/site'

export default function sitemap() {
  const staticPages = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/menu'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/mobile-flow'), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const dishPages = dishes.map((dish) => ({
    url: absoluteUrl(`/menu/${dish.id}`),
    images: [absoluteUrl(getImageUrl(dish.image))],
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...dishPages]
}
