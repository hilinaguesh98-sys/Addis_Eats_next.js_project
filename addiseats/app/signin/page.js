import { redirect } from 'next/navigation'
import SignInForm from './SignInForm'
import { getSession } from '../../lib/session'
import { getSafeNext } from '../../lib/session-token'
import { createOpenGraphMetadata } from '../../lib/site'

const title = 'Sign In'
const description = 'Sign in to Addis Eats to track your orders and complete your food delivery checkout.'
export const metadata = {
  title,
  description,
  openGraph: createOpenGraphMetadata(`${title} | AddisEats`, description, '/signin'),
  robots: { index: false, follow: false },
}

export default async function SignInPage({ searchParams }) {
  const params = await searchParams
  const requestedNext = typeof params.next === 'string' ? params.next : '/orders'
  const session = await getSession()

  if (session) redirect(getSafeNext(requestedNext) || '/')

  return <div className="page-wrap container"><section className="auth-panel"><p className="eyebrow">WELCOME BACK</p><h1>Sign in to Addis Eats</h1><p className="auth-copy">Access your orders and complete checkout.</p><SignInForm requestedNext={requestedNext}/></section></div>
}