import { notFound, redirect } from 'next/navigation'
import { getOrderForUser } from '../../../lib/orders'
import { getSession } from '../../../lib/session'
import OrderStatus from './OrderStatus'
import { absoluteUrl, createOpenGraphMetadata } from '../../../lib/site'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { id } = await params
  const title = 'Order Status'
  const description = 'Check the latest status and details for your Addis Eats delivery.'

  return {
    title,
    description,
    openGraph: {
      ...createOpenGraphMetadata(`${title} | AddisEats`, description, `/orders/${id}`),
      url: absoluteUrl(`/orders/${id}`),
    },
    robots: { index: false, follow: false },
  }
}

export default async function OrderPage({ params }) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect(`/signin?next=${encodeURIComponent(`/orders/${id}`)}`)
  const order = getOrderForUser(id, session.id)

  if (!order) notFound()

  return <OrderStatus initialOrder={order} />
}