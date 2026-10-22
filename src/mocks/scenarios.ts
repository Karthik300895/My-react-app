import { http, HttpResponse } from 'msw'
import {
  catalogResponseDtoSchema,
  PRODUCT_API_ORIGIN,
  type CatalogProductDto,
} from '../shared/api/dto'
import { productFixtures } from './fixtures/products'
import { listResponse } from './handlers'

const catalogUrl = `${PRODUCT_API_ORIGIN}/products`
const productUrl = `${PRODUCT_API_ORIGIN}/products/:id`

// AD-10: failure and edge scenarios, installed per test with `server.use(...)`.
export const scenarios = {
  networkError: http.get(catalogUrl, () => HttpResponse.error()),
  serverError: http.get(
    catalogUrl,
    () => new HttpResponse(null, { status: 500 }),
  ),
  /** `products.length !== total`: the adapter must reject this as a parse error (AD-6). */
  incompleteCatalog: http.get(catalogUrl, () =>
    HttpResponse.json(
      catalogResponseDtoSchema.parse({
        products: productFixtures.slice(0, 5),
        total: productFixtures.length,
        skip: 0,
        limit: 5,
      }),
    ),
  ),
  categoriesError: http.get(
    `${PRODUCT_API_ORIGIN}/products/categories`,
    () => new HttpResponse(null, { status: 503 }),
  ),
  productNetworkError: http.get(productUrl, () => HttpResponse.error()),
  /** Any status for the single-Product endpoint, e.g. 400 for a valid-looking id, or 500. */
  productStatus: (status: number) =>
    http.get(productUrl, () =>
      HttpResponse.json({ message: `Status ${status}` }, { status }),
    ),
  /** A catalog of exactly these products. */
  catalogOf: (products: CatalogProductDto[]) =>
    http.get(catalogUrl, ({ request }) =>
      listResponse(products, new URL(request.url)),
    ),
}
