import { notFound, redirect } from 'next/navigation'
import { getOrderForSession } from '../../../lib/orders'
import { getSession } from '../../../lib/session'
import { createOpenGraphMetadata } from '../../../lib/site'
import TrackingClient from './TrackingClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { id } = await params
  const title = 'Live Delivery Tracking'
  const description = 'Follow your Addis Eats delivery status and see the courier and delivery area.'
  return {
    title,
    description,
    openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, `/track/${id}`),
    robots: { index: false, follow: false },
  }
}

export default async function TrackDeliveryPage({ params }) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect(`/signin?next=${encodeURIComponent(`/track/${id}`)}`)

  const order = getOrderForSession(id, session)
  if (!order) notFound()

  return <TrackingClient initialOrder={order} />
}
