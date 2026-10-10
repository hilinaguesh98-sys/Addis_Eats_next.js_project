import { notFound } from 'next/navigation'
import DishDetailClient from './DishDetailClient'
import { getDish, getImageUrl } from '../../../lib/data'
import { absoluteUrl } from '../../../lib/site'

export async function generateMetadata({ params }) {
  const { id } = await params
  const dish = getDish(id)

  if (!dish) {
    return {
      title: 'Dish Not Found',
      description: 'This dish is not currently available on Addis Eats.',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: dish.name,
    description: `${dish.description} Order ${dish.name} for ${dish.price.toLocaleString()} ETB from Addis Eats.`,
    openGraph: {
      title: `${dish.name} | Addis Eats`,
      description: dish.description,
      url: absoluteUrl(`/menu/${dish.id}`),
      images: [{
        url: absoluteUrl(dish.openGraphImage),
        width: 1200,
        height: 630,
        alt: dish.imageAlt || dish.name,
      }],
    },
  }
}

export default async function DishPage({ params }) {
  const { id } = await params
  const dish = getDish(id)
  if (!dish) notFound()

  const imageUrl = absoluteUrl(getImageUrl(dish.image))
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: dish.name,
    description: dish.description,
    image: imageUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ETB',
      price: dish.price,
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(`/menu/${dish.id}`),
    },
  }

  return <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
    />
    <DishDetailClient dish={dish} />
  </>
}
