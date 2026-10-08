import './globals.css'
import { Manrope } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getSession } from '../lib/session'
import { createOpenGraphMetadata, siteUrl } from '../lib/site'

const manrope = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-manrope' })
const defaultTitle = 'AddisEats | Ethiopian Food Delivery in Addis Ababa'
const defaultDescription = 'Order Ethiopian favorites and freshly made meals from local Addis Ababa restaurants, delivered to your door.'

export const metadata = {
  metadataBase: siteUrl,
  title: {
    default: defaultTitle,
    template: '%s | AddisEats',
  },
  description: defaultDescription,
  openGraph: {
    type: 'website',
    siteName: 'AddisEats',
    ...createOpenGraphMetadata(defaultTitle, defaultDescription, '/'),
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default async function RootLayout({ children }) {
  const session = await getSession()
  return <html lang="en"><body className={manrope.variable}><Header session={session}/><main>{children}</main><Footer/></body></html>
}
