import type { Product } from '../../../shared/model/product'

// FR31: 8 highest-rated Products, ties broken by id ascending so the order is stable.
export function topRated(products: Product[], limit: number): Product[] {
  return [...products]
    .sort((a, b) => b.rating - a.rating || a.id - b.id)
    .slice(0, limit)
}
