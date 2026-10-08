import { redirect } from 'next/navigation'
import CheckoutClient from './CheckoutClient'
import { getSession } from '../../../lib/session'
import { createOpenGraphMetadata } from '../../../lib/site'

const title = 'Checkout'
const description = 'Enter your delivery details and confirm your Addis Eats order securely.'
export const metadata = {
  title,
  description,
  openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, '/cart/checkout'),
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const session = await getSession()
  if (!session) redirect('/signin?next=%2Fcart%2Fcheckout')
  return <CheckoutClient />
}
