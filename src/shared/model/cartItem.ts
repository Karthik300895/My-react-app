import type { Money, Product } from './product'

/** AD-2: the Cart's own copy of a Product's fields. Refreshed only by AD-13 and AD-14. */
export type CartItemSnapshot = {
  productId: number
  title: string
  thumbnail: string
  unitPriceCents: Money
  stock: number
}

/** AD-3: one Cart Item per Product, with 1 ≤ quantity ≤ stock. */
export type CartItem = CartItemSnapshot & {
  quantity: number
}

/** AD-13: the only way a Product becomes a Cart snapshot. */
export function toCartItemSnapshot(product: Product): CartItemSnapshot {
  return {
    productId: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    unitPriceCents: product.priceCents,
    stock: product.stock,
  }
}
