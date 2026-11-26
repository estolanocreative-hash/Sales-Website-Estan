// Product data source.
// Intentionally empty: no products, prices, or images are invented.
// Add real items here (or load them from Supabase later, per the spec) once the business supplies them.

export type Category = 'physical' | 'digital' | 'service'

export interface Product {
  id: string
  name: string
  description: string
  category: Category
  /** Price in PHP. Confirm currency with the business. */
  price: number
  image?: string
}

export const products: Product[] = []
