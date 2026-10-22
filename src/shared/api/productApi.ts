import type { Category, Product, ProductDetails } from '../model/product'
import { ApiError } from './ApiError'
import {
  CATALOG_SELECT,
  catalogResponseDtoSchema,
  categoriesResponseDtoSchema,
  PRODUCT_API_ORIGIN,
  PRODUCT_SELECT,
  productDetailsDtoSchema,
  type CatalogProductDto,
} from './dto'

// AD-5: the only module that performs HTTP. It returns domain types and throws only ApiError.

/** A stalled request fails as a network error instead of loading forever. */
export const REQUEST_TIMEOUT_MS = 15_000

async function requestJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(`${PRODUCT_API_ORIGIN}${path}`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })
  } catch (cause) {
    throw new ApiError('network', { cause })
  }
  if (!response.ok) throw new ApiError('http', { status: response.status })
  try {
    return await response.json()
  } catch (cause) {
    throw new ApiError('parse', { cause })
  }
}

/**
 * AD-3: the only place a decimal price becomes integer cents. Product API prices have at
 * most two decimals, which `Math.round` maps exactly (half-cent inputs are out of contract).
 */
export function toCents(price: number): number {
  return Math.round(price * 100)
}

function toProduct(dto: CatalogProductDto): Product {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    priceCents: toCents(dto.price),
    category: dto.category,
    rating: dto.rating,
    stock: dto.stock,
    thumbnail: dto.thumbnail,
  }
}

function parseError(message: string): ApiError {
  return new ApiError('parse', { cause: new Error(message) })
}

/** AD-6: the whole catalog in one request; a partial or inconsistent catalog is rejected. */
export async function getCatalog(signal?: AbortSignal): Promise<Product[]> {
  const json = await requestJson(
    `/products?limit=0&select=${CATALOG_SELECT.join(',')}`,
    signal,
  )
  const parsed = catalogResponseDtoSchema.safeParse(json)
  if (!parsed.success) throw new ApiError('parse', { cause: parsed.error })
  const { products, total } = parsed.data
  if (products.length !== total)
    throw parseError(`Incomplete catalog: ${products.length} of ${total}`)
  if (new Set(products.map((p) => p.id)).size !== products.length)
    throw parseError('Catalog contains duplicate product ids')
  return products.map(toProduct)
}

/** FR3: the Category list for the filter; names come from the Product API. */
export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  const json = await requestJson('/products/categories', signal)
  const parsed = categoriesResponseDtoSchema.safeParse(json)
  if (!parsed.success) throw new ApiError('parse', { cause: parsed.error })
  if (new Set(parsed.data.map((c) => c.slug)).size !== parsed.data.length)
    throw parseError('Categories contain duplicate slugs')
  return parsed.data.map(({ slug, name }) => ({ slug, name }))
}

/**
 * FR7, FR9: one Product's full record. AD-8: for a single Product, HTTP 404 and 400 both
 * mean "no such Product" and become `not-found`, which is never retried.
 */
export async function getProduct(
  id: number,
  signal?: AbortSignal,
): Promise<ProductDetails> {
  let json: unknown
  try {
    json = await requestJson(
      `/products/${id}?select=${PRODUCT_SELECT.join(',')}`,
      signal,
    )
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.kind === 'http' &&
      (error.status === 404 || error.status === 400)
    )
      throw new ApiError('not-found', { status: error.status, cause: error })
    throw error
  }
  const parsed = productDetailsDtoSchema.safeParse(json)
  if (!parsed.success) throw new ApiError('parse', { cause: parsed.error })
  if (parsed.data.id !== id)
    throw parseError(`Requested product ${id}, received ${parsed.data.id}`)
  return { ...toProduct(parsed.data), images: parsed.data.images }
}
