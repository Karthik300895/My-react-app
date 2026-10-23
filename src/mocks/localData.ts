import { imageDataUri } from './localImages'
import { categoryFixtures } from './fixtures/categories'
import { productFixtures } from './fixtures/products'

// Development fallback: the same responses the Product API gives, built from the fixtures.
// Used only when the live API is unreachable (app/localFallback.ts). Never in production.

type Product = (typeof productFixtures)[number]

const withLocalImages = (product: Product): Product => ({
  ...product,
  thumbnail: imageDataUri(product.thumbnail),
  images: product.images.map(imageDataUri),
})

// `select` keeps only the requested fields plus `id`, as the live API does.
function pick(product: Product, select: string[] | null) {
  if (!select) return product
  const record = product as unknown as Record<string, unknown>
  return Object.fromEntries(
    ['id', ...select].filter((f) => f in record).map((f) => [f, record[f]]),
  )
}

const int = (params: URLSearchParams, name: string, fallback: number) => {
  const value = Number(params.get(name) ?? fallback)
  return Number.isInteger(value) && value >= 0 ? value : fallback
}

/** The JSON body for a Product API path, or `undefined` when the path is not a known route. */
export function localJson(path: string): unknown | undefined {
  const url = new URL(path, 'http://local')
  const params = url.searchParams
  const select = params.get('select')?.split(',').filter(Boolean) ?? null

  if (url.pathname === '/products/categories') return categoryFixtures

  const single = /^\/products\/(\d+)$/.exec(url.pathname)
  if (single) {
    const product = productFixtures.find((p) => String(p.id) === single[1])
    return product ? pick(withLocalImages(product), select) : undefined
  }

  if (url.pathname === '/products') {
    const limit = int(params, 'limit', 30)
    const skip = int(params, 'skip', 0)
    const all = productFixtures.map(withLocalImages)
    const page = limit === 0 ? all.slice(skip) : all.slice(skip, skip + limit)
    return {
      products: page.map((p) => pick(p, select)),
      total: all.length,
      skip,
      limit: page.length,
    }
  }
  return undefined
}
