'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function ThemeToggle() {
  const [theme, setTheme] = useState('light')
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    try {
      const initialTheme = localStorage.getItem('addisEatsTheme') === 'dark' ? 'dark' : 'light'
      document.documentElement.dataset.theme = initialTheme
      setTheme(initialTheme)
    } catch (error) {
      console.error('The saved theme preference could not be read.', error)
    }
  }, [])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    setTheme(nextTheme)
    setStorageError('')
    try {
      localStorage.setItem('addisEatsTheme', nextTheme)
    } catch (error) {
      console.error('The theme preference could not be saved.', error)
      setStorageError('The theme changed but could not be saved for future visits.')
    }
  }

  return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'}>
    <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span> {theme === 'dark' ? 'Light' : 'Dark'}<span className="sr-only" role="status">{storageError}</span>
  </button>
}

export default function Header({ session }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [signOutError, setSignOutError] = useState('')
  const mobileMenuButton = useRef(null)

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('addisEatsCart') || '[]')
        setCartCount(Array.isArray(cart) ? cart.reduce((sum, item) => sum + Number(item.qty || 0), 0) : 0)
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
    ['Cart', '/cart'],
    ...(session?.role === 'staff' ? [['Kitchen', '/kitchen'], ['Dashboard', '/dashboard']] : [])
  ]

  async function signOut() {
    setSignOutError('')
    try {
      const response = await fetch('/api/auth', { method: 'DELETE' })
      if (!response.ok) throw new Error('Sign-out request failed.')
      window.location.assign('/')
    } catch {
      setSignOutError('Sign out could not be completed. Please try again.')
    }
  }

  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      mobileMenuButton.current?.focus()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo" aria-label="AddisEats home">
          <>Addis<span>Eats</span></>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            const accessibleLabel = href === '/cart' && cartCount ? `Cart, ${cartCount} items` : label
            return <Link key={href} href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} aria-label={accessibleLabel}>{label}{href === '/cart' && cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}</Link>
          })}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          {session ? <button type="button" className="auth-button" onClick={signOut}>Sign out</button> : <Link className="auth-button" href="/signin">Sign in</Link>}
          <button ref={mobileMenuButton} className="mobile-menu" type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation">☰</button>
        </div>
      </div>
      {signOutError && <p className="header-error" role="alert">{signOutError}</p>}
      {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
        {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}{href === '/cart' && cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}</Link>)}
        <ThemeToggle />
        {session ? <button type="button" onClick={signOut}>Sign out</button> : <Link href="/signin" onClick={() => setOpen(false)}>Sign in</Link>}
      </nav>}
    </header>
  )
}
