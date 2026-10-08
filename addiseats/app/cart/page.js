import CartClient from '../../components/CartClient'
import { createOpenGraphMetadata } from '../../lib/site'

const title = 'Your Cart'
const description = 'Review your selected Addis Eats dishes, adjust quantities, and see your delivery total before checkout.'
export const metadata = {
  title,
  description,
  openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, '/cart'),
  robots: { index: false, follow: false },
}

export default function CartPage() { 
  return <div className="page-wrap container"><CartClient /></div>
}
