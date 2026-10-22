import type { Product } from '../../../shared/model/product'
import { SORT_OPTIONS, type ListingCriteria } from './criteria'

// AD-6: search, Category filter and sort are pure functions over the whole catalog.
// AD-9: nothing here filters on stock.

/** FR2: case-insensitive match on title or description. An empty query matches everything. */
export function matchesSearch(product: Product, query: string): boolean {
  // Locale-independent folding, so results don't change with the browser's language.
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    product.title.toLowerCase().includes(needle) ||
    product.description.toLowerCase().includes(needle)
  )
}

/** FR3: an empty slug means "All categories". */
export function matchesCategory(product: Product, category: string): boolean {
  return !category || product.category === category
}

/** FR4, FR5: only Products matching every criterion, then sorted (stable) as a whole set. */
export function applyCriteria(
  products: Product[],
  { q, category, sort }: Pick<ListingCriteria, 'q' | 'category' | 'sort'>,
): Product[] {
  const filtered = products.filter(
    (product) =>
      matchesSearch(product, q) && matchesCategory(product, category),
  )
  const compare = SORT_OPTIONS.find((option) => option.value === sort)?.compare
  return compare ? [...filtered].sort(compare) : filtered
}

/** FR6: names the active criteria, e.g. `No products match “steel” in Mens Watches.` */
export function describeNoMatch(query: string, categoryName: string): string {
  if (query && categoryName)
    return `No products match “${query}” in ${categoryName}.`
  if (query) return `No products match “${query}”.`
  if (categoryName) return `No products match the ${categoryName} category.`
  return 'No products match.'
}
