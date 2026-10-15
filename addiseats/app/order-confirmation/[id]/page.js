import { notFound, redirect } from 'next/navigation'
import OrderConfirmationClient from './OrderConfirmationClient'
import { getOrderForUser } from '../../../lib/orders'
import { getSession } from '../../../lib/session'
import { createOpenGraphMetadata } from '../../../lib/site'

export async function generateMetadata({ params }) {
  const { id } = await params
  const title = 'Order Confirmation'
  const description = 'View your order confirmation and current Addis Eats delivery status.'

  return {
    title,
    description,
    openGraph: createOpenGraphMetadata(
      `${title} | AddisEats`,
      description,
      `/order-confirmation/${id}`
    ),
    robots: { index: false, follow: false },
  }
}

export default async function OrderConfirmationPage({ params }) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect(`/signin?next=${encodeURIComponent(`/order-confirmation/${id}`)}`)

  const order = getOrderForUser(id, session.id)
  if (!order) notFound()

  return <OrderConfirmationClient initialOrder={order} />
}
