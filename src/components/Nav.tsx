import { useState } from 'react'
import { Menu, ShoppingBag, User, X } from 'lucide-react'
import { useCart } from '../cart/CartContext'

const links = [
  { href: '#shop', label: 'Shop' },
  { href: '#about', label: 'About' },
  { href: '#why', label: 'Why us' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const { count, open: openCart } = useCart()
  const cartCount = count

  return (
    <header className="nav">
      <div className="nav__inner">
        <a href="#top" className="nav__brand" aria-label="Cognex home">
          <img src="/assets/logo-placeholder.webp" alt="" width="36" height="36" />
          <span>Cognex</span>
        </a>

        <nav
          className={`nav__links ${open ? 'is-open' : ''}`}
          aria-label="Primary"
          onClick={() => setOpen(false)}
        >
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            onClick={openCart}
          >
            <ShoppingBag size={20} aria-hidden="true" />
            {cartCount > 0 && <span className="icon-btn__count">{cartCount}</span>}
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Account (sign-in not yet available)"
            disabled
          >
            <User size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn nav__toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}
