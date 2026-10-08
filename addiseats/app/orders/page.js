import { redirect } from 'next/navigation'
import { getOrdersForUser } from '../../lib/orders'
import { getSession } from '../../lib/session'
import OrdersList from './OrdersList'
import { createOpenGraphMetadata } from '../../lib/site'

const title = 'Your Orders'
const description = 'See the status and details of your Addis Eats orders in one convenient place.'
export const metadata = {
  title,
  description,
  openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, '/orders'),
  robots: { index: false, follow: false },
}

export default async function OrdersPage() {
  const session = await getSession()
  if (!session) redirect('/signin?next=%2Forders')

  return <OrdersList orders={getOrdersForUser(session.id)}/>
}
