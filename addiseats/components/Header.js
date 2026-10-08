'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header({ session }) {
  const pathname = usePathname()
  const showWordmark = !pathname.startsWith('/menu')
  const [open, setOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('addisEatsCart') || '[]')
        setCartCount(cart.reduce((sum, item) => sum + Number(item.qty || 0), 0))
      } catch {
        setCartCount(0)
      }
    }
    update()
    window.addEventListener('addis-cart-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('addis-cart-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  const links = [
    ['Home', '/'],
    ['Menu', '/menu'],
    ['Favorites', '/favorites'],
    ['Orders', '/orders'],
    ...(session?.role === 'staff' ? [['Kitchen', '/kitchen']] : [])
  ]

  async function signOut() {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.assign('/')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo" aria-label="AddisEats home">
          {showWordmark
            ? <Image src="/addiseats-logo.png" alt="AddisEats" width={231} height={89} style={{ width: 170, height: 'auto' }} />
            : <>Addis<span>Eats</span></>}
        </Link>
        <nav className="desktop-nav">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={pathname === href || (href !== '/' && pathname.startsWith(href)) ? 'active' : ''}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="header-icon" aria-label="Search"></button>
          <Link href="/cart" className="cart-link" aria-label="Cart">cart♧{cartCount > 0 && <span>{cartCount}</span>}</Link>
          {session ? <button className="auth-button" onClick={signOut}>Sign out</button> : <Link className="auth-button" href="/signin">Sign in</Link>}
          <button className="mobile-menu" onClick={() => setOpen((value) => !value)} aria-label="Open menu">☰</button>
        </div>
      </div>
      {open && <nav className="mobile-nav">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}<Link href="/cart" onClick={() => setOpen(false)}>Cart</Link>{session ? <button onClick={signOut}>Sign out</button> : <Link href="/signin">Sign in</Link>}</nav>}
    </header>
  )
}
