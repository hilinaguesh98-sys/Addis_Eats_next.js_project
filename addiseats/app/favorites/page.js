import FavoritesClient from './FavoritesClient'
import { createOpenGraphMetadata } from '../../lib/site'

const title = 'Saved Favorites'
const description = 'Keep the Addis Eats meals you love in one place and find them quickly when you are ready to order again.'
export const metadata = {
  title,
  description,
  openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, '/favorites'),
  robots: { index: false, follow: false },
}

export default function FavoritesPage() {
  return <FavoritesClient />                 
  
}
