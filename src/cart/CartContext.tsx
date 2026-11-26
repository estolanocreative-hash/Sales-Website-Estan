import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { products, type Product } from '../data/products'

// Cart line. Stores only the product id and quantity, never a price.
// Prices are always read from the product catalog, and must be re-validated on the server at checkout (spec section 10).
export interface CartLine {
  productId: string
  quantity: number
}

interface CartState {
  lines: CartLine[]
  isOpen: boolean
}

type Action =
  | { type: 'add'; productId: string; quantity: number }
  | { type: 'set'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'hydrate'; lines: CartLine[] }

const MAX_QTY = 99
const STORAGE_KEY = 'cognex-cart-v1'

function clampQty(n: number) {
  return Math.min(MAX_QTY, Math.max(1, Math.floor(n)))
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state.lines.find((l) => l.productId === action.productId)
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.productId === action.productId
              ? { ...l, quantity: clampQty(l.quantity + action.quantity) }
              : l,
          ),
        }
      }
      return {
        ...state,
        lines: [...state.lines, { productId: action.productId, quantity: clampQty(action.quantity) }],
      }
    }
    case 'set':
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.productId === action.productId ? { ...l, quantity: clampQty(action.quantity) } : l,
        ),
      }
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.productId !== action.productId) }
    case 'open':
      return { ...state, isOpen: true }
    case 'close':
      return { ...state, isOpen: false }
    case 'hydrate':
      return { ...state, lines: action.lines }
  }
}

/** Reads the saved cart and drops anything that is no longer in the catalog or is malformed. */
function loadLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const known = new Set(products.map((p) => p.id))
    return parsed.flatMap((item): CartLine[] => {
      if (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CartLine).productId === 'string' &&
        typeof (item as CartLine).quantity === 'number' &&
        known.has((item as CartLine).productId)
      ) {
        return [{ productId: (item as CartLine).productId, quantity: clampQty((item as CartLine).quantity) }]
      }
      return []
    })
  } catch {
    return []
  }
}

interface CartContextValue {
  lines: CartLine[]
  items: { product: Product; quantity: number }[]
  count: number
  subtotal: number
  isOpen: boolean
  open: () => void
  close: () => void
  add: (productId: string, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], isOpen: false })

  // Load once on mount (localStorage is not available during SSR, and this app is client-only).
  useEffect(() => {
    dispatch({ type: 'hydrate', lines: loadLines() })
  }, [])

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines))
    } catch {
      // Storage may be full or blocked. The cart still works for this visit.
    }
  }, [state.lines])

  const value = useMemo<CartContextValue>(() => {
    const items = state.lines.flatMap((line) => {
      const product = products.find((p) => p.id === line.productId)
      return product ? [{ product, quantity: line.quantity }] : []
    })
    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    return {
      lines: state.lines,
      items,
      count,
      subtotal,
      isOpen: state.isOpen,
      open: () => dispatch({ type: 'open' }),
      close: () => dispatch({ type: 'close' }),
      add: (productId, quantity = 1) => dispatch({ type: 'add', productId, quantity }),
      setQuantity: (productId, quantity) => dispatch({ type: 'set', productId, quantity }),
      remove: (productId) => dispatch({ type: 'remove', productId }),
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
