import Link from 'next/link'
import { createOpenGraphMetadata } from '../../lib/site'

const screens = [
  ['01','Home','Search & Discover','Find popular Ethiopian and international meals.', '/'],
  ['02','Menu','Choose Your Meal','Filter by category and browse every dish.', '/menu'],
  ['03','Favorites','Save Meals','Tap the heart to keep your favorite dishes.', '/favorites'],
  ['04','Cart','Review Order','Adjust quantities and see your total.', '/cart'],
  ['05','Checkout','Enter Details','Add your name, phone and delivery address.', '/cart/checkout'],
  ['06','Confirmation','Order Confirmed','Get your order number and delivery estimate.', '/orders']
]

export const metadata = {
  title: 'Mobile Ordering Experience',
  description: 'See how Addis Eats makes it easy to discover meals, save favorites, and order from your phone.',
  openGraph: createOpenGraphMetadata(
    'Mobile Ordering Experience | AddisEats',
    'See how Addis Eats makes it easy to discover meals, save favorites, and order from your phone.',
    '/mobile-flow'
  ),
}

export default function MobileFlowPage() {
  return <div className="page-wrap container"><div className="page-title"><p className="eyebrow">RESPONSIVE EXPERIENCE</p><h1>Mobile Flow</h1><p>The complete Addis Eats experience is responsive from browsing to confirmation.</p></div><div className="mobile-flow-grid">{screens.map(([number, title, heading, text, href]) => <Link href={href} className="phone-card" key={number}><div className="phone-top"><span>Addis<span>Eats</span></span><small>{number}</small></div><div className="phone-screen"><span>STEP {number}</span><h3>{heading}</h3><p>{text}</p><b>{title} →</b></div></Link>)}</div></div>
}
