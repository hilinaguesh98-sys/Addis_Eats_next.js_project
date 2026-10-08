import { redirect } from 'next/navigation'
import { getOrders } from '../../lib/orders'
import { getSession } from '../../lib/session'
import { createOpenGraphMetadata } from '../../lib/site'
import KitchenOrders from './KitchenOrders'

const title = 'Kitchen Orders'
const description = 'Staff order dashboard for preparing and tracking active Addis Eats deliveries.'
export const metadata = {
  title,
  description,
  openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, '/kitchen'),
  robots: { index: false, follow: false },
}

export default async function KitchenPage() {
  const session = await getSession()
  if (!session) redirect('/signin?next=%2Fkitchen')
  if (session.role !== 'staff') redirect('/orders')

  const orders = getOrders()

  return <div className="page-wrap container"><div className="page-title"><p className="eyebrow">STAFF ONLY</p><h1>Kitchen orders</h1><p>Active orders across Addis Eats.</p></div><KitchenOrders orders={orders}/></div>
}