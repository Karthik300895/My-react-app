/** Integer US cents. Decimal prices are converted only by the Product API adapter (AD-3, AD-5). */
export type Money = number

/** A Product as the shop sees it, independent of the Product API's field names (AD-5). */
export type Product = {
  id: number
  title: string
  description: string
  priceCents: Money
  /** Category slug, e.g. `mens-shirts`. */
  category: string
  /** 0–5. */
  rating: number
  stock: number
  thumbnail: string
}

/** A named grouping of Products, referred to by slug (AD-7). */
export type Category = {
  slug: string
  name: string
}

/** The full record Product Details shows: every image, in API order (AD-6). */
export type ProductDetails = Product & {
  images: string[]
}
