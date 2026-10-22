import { http, HttpResponse, type AnyHandler } from 'msw'
import { z } from 'zod'
import {
  catalogProductDtoSchema,
  catalogResponseDtoSchema,
  categoriesResponseDtoSchema,
  PRODUCT_API_ORIGIN,
  productDetailsDtoSchema,
  type CatalogProductDto,
  type ProductDetailsDto,
} from '../shared/api/dto'
import { categoryFixtures } from './fixtures/categories'
import { productFixtures } from './fixtures/products'

export { PRODUCT_API_ORIGIN }

// DummyJSON's default page size when `limit` is absent.
const DEFAULT_LIMIT = 30

function pick(
  product: CatalogProductDto | ProductDetailsDto,
  fields: string[] | null,
) {
  if (!fields) return product
  const record = product as Record<string, unknown>
  return Object.fromEntries(
    ['id', ...fields].filter((f) => f in record).map((f) => [f, record[f]]),
  )
}

/** A DummyJSON-style list response, honouring `limit` (0 = all), `skip` and `select`. */
export function listResponse(products: CatalogProductDto[], url: URL) {
  const int = (name: string, fallback: number) => {
    const value = Number(url.searchParams.get(name) ?? fallback)
    return Number.isInteger(value) && value >= 0 ? value : fallback
  }
  const limit = int('limit', DEFAULT_LIMIT)
  const skip = int('skip', 0)
  const select =
    url.searchParams.get('select')?.split(',').filter(Boolean) ?? null
  const page =
    limit === 0 ? products.slice(skip) : products.slice(skip, skip + limit)
  const body = {
    products: page.map((product) => pick(product, select)),
    total: products.length,
    skip,
    limit: page.length,
  }
  // AD-10: every response is built through the DTO schemas, so mocks can't drift from them.
  return HttpResponse.json(
    (select ? selectedResponseSchema : catalogResponseDtoSchema).parse(body),
  )
}

/** DummyJSON's error body for a bad or unknown single-Product id. */
function productError(status: 400 | 404, id: string) {
  const message =
    status === 404
      ? `Product with id '${id}' not found`
      : `Invalid product id '${id}'`
  return HttpResponse.json({ message }, { status })
}

/** DummyJSON-style `GET /products/:id`, honouring `select`; built through the DTO schema. */
export function productResponse(
  products: ProductDetailsDto[],
  id: string,
  url: URL,
) {
  if (!/^\d+$/.test(id)) return productError(400, id)
  const product = products.find((p) => p.id === Number(id))
  if (!product) return productError(404, id)
  const select =
    url.searchParams.get('select')?.split(',').filter(Boolean) ?? null
  const schema = select
    ? productDetailsDtoSchema.partial().required({ id: true })
    : productDetailsDtoSchema
  return HttpResponse.json(schema.parse(pick(product, select)))
}

/** With `select`, items carry `id` plus only the requested fields. */
const selectedResponseSchema = catalogResponseDtoSchema.extend({
  products: z.array(catalogProductDtoSchema.partial().required({ id: true })),
})

// AD-10: handlers match only the Product API origin; everything else is bypassed (dev)
// or fails the test (vitest.setup.ts).
export const handlers: AnyHandler[] = [
  http.get(`${PRODUCT_API_ORIGIN}/products`, ({ request }) =>
    listResponse(productFixtures, new URL(request.url)),
  ),
  // Registered before /products/:id so the literal path wins.
  http.get(`${PRODUCT_API_ORIGIN}/products/categories`, () =>
    HttpResponse.json(categoriesResponseDtoSchema.parse(categoryFixtures)),
  ),
  http.get(`${PRODUCT_API_ORIGIN}/products/:id`, ({ request, params }) =>
    productResponse(productFixtures, String(params.id), new URL(request.url)),
  ),
]
