// AD-9: the single source of availability state and text. No surface filters on stock.

export const LOW_STOCK_THRESHOLD = 5

export type StockLevel = 'in-stock' | 'low-stock' | 'out-of-stock'

type HasStock = { stock: number }

export function isAvailable({ stock }: HasStock): boolean {
  return stock > 0
}

export function stockLevel({ stock }: HasStock): StockLevel {
  if (stock <= 0) return 'out-of-stock'
  if (stock <= LOW_STOCK_THRESHOLD) return 'low-stock'
  return 'in-stock'
}

/** FR8: stock is always stated in text, never by colour alone. */
export function stockLabel(product: HasStock): string {
  switch (stockLevel(product)) {
    case 'out-of-stock':
      return 'Out of stock'
    case 'low-stock':
      return `Only ${product.stock} left`
    case 'in-stock':
      return 'In stock'
  }
}
