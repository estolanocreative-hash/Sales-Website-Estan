import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import type { Category } from '../data/products'
import './checkout.css'

interface ShippingForm {
  fullName: string
  phone: string
  line1: string
  city: string
  province: string
  postalCode: string
}

const emptyShipping: ShippingForm = {
  fullName: '',
  phone: '',
  line1: '',
  city: '',
  province: '',
  postalCode: '',
}

const PHONE_RE = /^[0-9+\-\s()]{7,20}$/
const POSTAL_RE = /^[0-9]{4}$/

function validateShipping(f: ShippingForm): string | null {
  if (!f.fullName.trim()) return 'Enter the recipient’s full name.'
  if (!PHONE_RE.test(f.phone.trim())) return 'Enter a valid phone number.'
  if (!f.line1.trim()) return 'Enter the street address.'
  if (!f.city.trim()) return 'Enter the city or municipality.'
  if (!f.province.trim()) return 'Enter the province.'
  if (!POSTAL_RE.test(f.postalCode.trim())) return 'Enter a 4-digit postal code.'
  return null
}

const typeLabel: Record<Category, string> = {
  physical: 'Physical product',
  digital: 'Digital product',
  service: 'Service',
}

export function CheckoutPage() {
  const { user, loading } = useAuth()
  const { items, subtotal, count } = useCart()
  const [shipping, setShipping] = useState<ShippingForm>(emptyShipping)
  const [bookingNote, setBookingNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  if (loading) {
    return (
      <main className="checkout">
        <p>Loading…</p>
      </main>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  const needsShipping = items.some((i) => i.product.category === 'physical')
  const hasServices = items.some((i) => i.product.category === 'service')
  const hasDigital = items.some((i) => i.product.category === 'digital')

  if (items.length === 0) {
    return (
      <main className="checkout">
        <div className="checkout__inner">
          <h1 className="checkout__title">Checkout</h1>
          <div className="empty">
            <h3>Your cart is empty</h3>
            <p>
              <Link to="/#shop">Go to the shop</Link>
            </p>
          </div>
        </div>
      </main>
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (needsShipping) {
      const problem = validateShipping(shipping)
      if (problem) return setError(problem)
    }
    // Details are valid. Nothing is saved or charged yet: orders and payments are not connected.
    setReady(true)
  }

  return (
    <main className="checkout">
      <div className="checkout__inner">
        <p className="eyebrow">Checkout</p>
        <h1 className="checkout__title">Review and details</h1>

        <div className="notice notice--info" role="status">
          Payments are not turned on yet. You can review your details here, but no order is placed and nothing is charged.
        </div>

        <div className="checkout__grid">
          <form className="checkout__form" onSubmit={onSubmit} noValidate>
            {needsShipping && (
              <fieldset className="checkout__block">
                <legend>Shipping address</legend>
                <label className="field">
                  <span>Full name</span>
                  <input value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} />
                </label>
                <label className="field">
                  <span>Phone number</span>
                  <input type="tel" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />
                </label>
                <label className="field">
                  <span>Street address</span>
                  <input value={shipping.line1} onChange={(e) => setShipping({ ...shipping, line1: e.target.value })} />
                </label>
                <div className="checkout__row">
                  <label className="field">
                    <span>City or municipality</span>
                    <input value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Province</span>
                    <input value={shipping.province} onChange={(e) => setShipping({ ...shipping, province: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Postal code</span>
                    <input inputMode="numeric" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} />
                  </label>
                </div>
                <p className="checkout__hint">Shipping fees will be calculated once the courier is configured.</p>
              </fieldset>
            )}

            {hasServices && (
              <fieldset className="checkout__block">
                <legend>Service request</legend>
                <label className="field">
                  <span>Notes or preferred schedule (optional)</span>
                  <textarea rows={3} value={bookingNote} onChange={(e) => setBookingNote(e.target.value)} />
                </label>
                <p className="checkout__hint">Bookings are confirmed by the business after you submit. Nothing is booked yet.</p>
              </fieldset>
            )}

            {hasDigital && (
              <fieldset className="checkout__block">
                <legend>Digital delivery</legend>
                <p className="checkout__hint">Digital items become available in My downloads after a verified payment.</p>
              </fieldset>
            )}

            {error && <div className="notice notice--error" role="alert">{error}</div>}
            {ready && (
              <div className="notice notice--info" role="status">
                Your details are valid. Placing orders is not available yet.
              </div>
            )}

            <fieldset className="checkout__block">
              <legend>Payment</legend>
              <ul className="pay-options">
                <li>
                  <strong>PayPal</strong>
                  <span>Not enabled yet</span>
                </li>
                <li>
                  <strong>GCash via QRPh</strong>
                  <span>Not enabled yet</span>
                </li>
              </ul>
              <p className="checkout__hint">An order is marked paid only after the payment provider confirms it.</p>
            </fieldset>

            <button type="submit" className="btn btn--primary">
              Check details
            </button>
            <button type="button" className="btn btn--ghost" disabled>
              Place order (not available yet)
            </button>
          </form>

          <aside className="checkout__summary" aria-label="Order summary">
            <h2>Order summary ({count})</h2>
            <ul>
              {items.map(({ product, quantity }) => (
                <li key={product.id}>
                  <div>
                    <p className="sum__name">{product.name}</p>
                    <p className="sum__meta">
                      {typeLabel[product.category]} × {quantity}
                    </p>
                  </div>
                  <p>₱{(product.price * quantity).toLocaleString('en-PH')}</p>
                </li>
              ))}
            </ul>
            <div className="sum__total">
              <span>Subtotal</span>
              <strong>₱{subtotal.toLocaleString('en-PH')}</strong>
            </div>
            <p className="checkout__hint">Shipping and taxes are added at payment time.</p>
          </aside>
        </div>
      </div>
    </main>
  )
}
