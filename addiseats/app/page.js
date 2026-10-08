import HomeClient from './HomeClient'
import { createOpenGraphMetadata } from '../lib/site'

export const metadata = {
  title: { absolute: 'Ethiopian Food Delivery in Addis Ababa | AddisEats' },
  description: 'Discover Ethiopian classics and international favorites from Addis Ababa restaurants, then order for fast local delivery.',
  openGraph: createOpenGraphMetadata(
    'Ethiopian Food Delivery in Addis Ababa | AddisEats',
    'Discover Ethiopian classics and international favorites from Addis Ababa restaurants, then order for fast local delivery.',
    '/'
  ),
}

export default function HomePage() {
  return <HomeClient />
}
