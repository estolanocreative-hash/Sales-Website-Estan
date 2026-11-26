import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../cart/CartContext'

export function CartDrawer() {
  const { isOpen, close, items, subtotal, count, setQuantity, remove } = useCart()
  const panelRef = useRef<HTMLElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // While open: Escape closes, focus moves into the panel, and page scroll is locked.
  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeBtnRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div className="drawer-root">
      <button type="button" className="drawer-backdrop" aria-label="Close cart" onClick={close} />
      <aside
        ref={panelRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <header className="drawer__header">
          <h2 id="cart-title">Your cart ({count})</h2>
          <button ref={closeBtnRef} type="button" className="icon-btn" aria-label="Close cart" onClick={close}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer__empty">
            <ShoppingBag size={32} aria-hidden="true" />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <ul className="drawer__list">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="line">
                <div className="line__thumb" aria-hidden="true">
                  <ShoppingBag size={20} />
                </div>
                <div className="line__info">
                  <p className="line__name">{product.name}</p>
                  <p className="line__price">₱{product.price.toLocaleString('en-PH')}</p>
                  <div className="qty" role="group" aria-label={`Quantity for ${product.name}`}>
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => (quantity <= 1 ? remove(product.id) : setQuantity(product.id, quantity - 1))}
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span aria-live="polite">{quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(product.id, quantity + 1)}
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="line__end">
                  <p className="line__total">₱{(product.price * quantity).toLocaleString('en-PH')}</p>
                  <button
                    type="button"
                    className="line__remove"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => remove(product.id)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <footer className="drawer__footer">
          <div className="drawer__subtotal">
            <span>Subtotal</span>
            <strong>₱{subtotal.toLocaleString('en-PH')}</strong>
          </div>
          <p className="drawer__note">Shipping and taxes are calculated at checkout.</p>
          <button type="button" className="btn btn--ghost" onClick={close}>
            Continue shopping
          </button>
          {items.length > 0 ? (
            <Link to="/checkout" className="btn btn--primary" onClick={close}>
              Proceed to checkout
            </Link>
          ) : (
            <button type="button" className="btn btn--primary" disabled>
              Proceed to checkout
            </button>
          )}
          <p className="drawer__note">
            Payments are not turned on yet. Checkout shows your details but does not place orders.
          </p>
        </footer>
      </aside>
    </div>
  )
}
