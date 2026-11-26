import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { products, type Category, type Product } from '../data/products'
import { useCart } from '../cart/CartContext'
import { Section } from './Section'

type Tab = 'all' | Category

const tabs: { value: Tab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'physical', label: 'Physical Products' },
  { value: 'digital', label: 'Digital Products' },
  { value: 'service', label: 'Services' },
]

const categoryLabel: Record<Category, string> = {
  physical: 'Physical',
  digital: 'Digital',
  service: 'Service',
}

function matches(product: Product, query: string) {
  if (!query) return true
  const q = query.toLowerCase()
  return product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q)
}

export function Shop() {
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const { add } = useCart()

  const visible = useMemo(
    () =>
      products.filter(
        (p) => (tab === 'all' || p.category === tab) && matches(p, query.trim()),
      ),
    [tab, query],
  )

  return (
    <Section id="shop" eyebrow="Shop" title="Everything we offer">
      <div className="shop__controls">
        <div className="tabs" role="tablist" aria-label="Filter by category">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              className={`tab ${tab === t.value ? 'is-active' : ''}`}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="search">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Search products and services</span>
          <input
            type="search"
            placeholder="Search products and services"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="search__clear"
              aria-label="Clear search"
              onClick={() => setQuery('')}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="empty" role="status">
          {products.length === 0 ? (
            <>
              <h3>No products yet</h3>
              <p>The catalog will appear here once the business adds its products and services.</p>
            </>
          ) : (
            <>
              <h3>No results</h3>
              <p>Try a different search or category.</p>
            </>
          )}
        </div>
      ) : (
        <ul className="grid" aria-live="polite">
          {visible.map((p) => (
            <li key={p.id} className="card">
              <span className="card__tag">{categoryLabel[p.category]}</span>
              <h3 className="card__title">{p.name}</h3>
              <p className="card__desc">{p.description}</p>
              <p className="card__price">₱{p.price.toLocaleString('en-PH')}</p>
              <button type="button" className="btn btn--outline" onClick={() => add(p.id)}>
                Add to cart
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
