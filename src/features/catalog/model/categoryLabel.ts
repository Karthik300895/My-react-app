/**
 * A display label for a Category slug (`mens-shirts` → "Mens Shirts").
 * Stand-in until Story 1.4 brings Category names from getCategories().
 */
export function categoryLabel(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}
