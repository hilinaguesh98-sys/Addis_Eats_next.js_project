import { redirect } from 'next/navigation'
import CheckoutClient from '../cart/checkout/CheckoutClient'
import { getSession } from '../../lib/session'
import { createOpenGraphMetadata } from '../../lib/site'

const title = 'Checkout'
const description = 'Enter your delivery details and confirm your Addis Eats order securely.'

export const metadata = {
  title,
  description,
  openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, '/checkout'),
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const session = await getSession()
  if (!session) redirect('/signin?next=%2Fcheckout')
  return <CheckoutClient />
}
