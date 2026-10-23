import { z } from 'zod'

// AD-5: DummyJSON response shapes. Only `zod` is imported here, so the Node-run
// contract check (tooling/contract-live.ts) and the MSW fixtures share these schemas.

// Build-time override for the budget run: VITE_PRODUCT_API_ORIGIN points the app at a local
// stub (tooling/api-stub.mjs). Unset, it is DummyJSON. Node (contract check) has no import.meta.env.
const ENV = (import.meta as { env?: Record<string, string | undefined> }).env
export const PRODUCT_API_ORIGIN =
  ENV?.VITE_PRODUCT_API_ORIGIN || 'https://dummyjson.com'

/** The single list of fields the catalog requests (`id` is always returned). */
export const CATALOG_SELECT = [
  'title',
  'description',
  'price',
  'category',
  'rating',
  'stock',
  'thumbnail',
] as const

export const catalogProductDtoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  price: z.number().nonnegative(),
  category: z.string().min(1),
  rating: z.number().min(0).max(5),
  stock: z.number().int().nonnegative(),
  thumbnail: z.url(),
})

/** FR7: Product Details requests the catalog fields plus every image. */
export const PRODUCT_SELECT = [...CATALOG_SELECT, 'images'] as const

export const productDetailsDtoSchema = catalogProductDtoSchema.extend({
  images: z.array(z.url()),
})

export const catalogResponseDtoSchema = z.object({
  products: z.array(catalogProductDtoSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
})

/** AD-7: a Category slug, the same rule for API data and the `category` URL value. */
export const CATEGORY_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const categoryDtoSchema = z.object({
  slug: z.string().regex(CATEGORY_SLUG),
  name: z.string().min(1),
  url: z.url(),
})

export const categoriesResponseDtoSchema = z.array(categoryDtoSchema)

export type CategoryDto = z.infer<typeof categoryDtoSchema>
export type ProductDetailsDto = z.infer<typeof productDetailsDtoSchema>
export type CatalogProductDto = z.infer<typeof catalogProductDtoSchema>
export type CatalogResponseDto = z.infer<typeof catalogResponseDtoSchema>
