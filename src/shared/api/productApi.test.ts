import { http, HttpResponse, type JsonBodyType } from 'msw'
import { describe, expect, it } from 'vitest'
import { productFixtures } from '../../mocks/fixtures/products'
import { server } from '../../mocks/node'
import { scenarios } from '../../mocks/scenarios'
import { ApiError } from './ApiError'
import { CATALOG_SELECT, PRODUCT_API_ORIGIN, PRODUCT_SELECT } from './dto'
import { categoryFixtures } from '../../mocks/fixtures/categories'
import { getCatalog, getCategories, getProduct, toCents } from './productApi'

async function catalogError(): Promise<ApiError> {
  const error = await getCatalog().then(
    () => null,
    (e: unknown) => e,
  )
  expect(error).toBeInstanceOf(ApiError)
  return error as ApiError
}

describe('getCatalog (AD-5, AD-6)', () => {
  it('FR1: requests the whole catalog with the single field list', async () => {
    let requested: URL | undefined
    server.events.on('request:start', ({ request }) => {
      requested = new URL(request.url)
    })

    try {
      await getCatalog()
    } finally {
      server.events.removeAllListeners()
    }

    expect(requested?.origin).toBe(PRODUCT_API_ORIGIN)
    expect(requested?.pathname).toBe('/products')
    expect(requested?.searchParams.get('limit')).toBe('0')
    expect(requested?.searchParams.get('select')).toBe(CATALOG_SELECT.join(','))
  })

  it('FR1: returns domain Products with prices in integer cents', async () => {
    const products = await getCatalog()

    expect(products).toHaveLength(productFixtures.length)
    expect(products[0]).toEqual({
      id: 1,
      title: 'Essence Mascara Lash Princess',
      description: expect.any(String),
      priceCents: 999,
      category: 'beauty',
      rating: 4.94,
      stock: 5,
      thumbnail: expect.stringMatching(/^https:\/\/cdn\.dummyjson\.com\//),
    })
    expect(products.every((p) => Number.isInteger(p.priceCents))).toBe(true)
  })

  it('AD-9: keeps out-of-stock Products in the catalog', async () => {
    const products = await getCatalog()
    expect(products.filter((p) => p.stock === 0).length).toBeGreaterThanOrEqual(2)
  })

  it('AD-6: rejects an incomplete catalog as a parse error', async () => {
    server.use(scenarios.incompleteCatalog)
    expect((await catalogError()).kind).toBe('parse')
  })

  it('FR34: a fetch failure is a network error', async () => {
    server.use(scenarios.networkError)
    expect((await catalogError()).kind).toBe('network')
  })

  it('FR34: a 5xx response is an http error with its status', async () => {
    server.use(scenarios.serverError)
    const error = await catalogError()
    expect(error.kind).toBe('http')
    expect(error.status).toBe(500)
  })

  it('AD-8: a response that fails the DTO schema is a parse error', async () => {
    server.use(
      http.get(`${PRODUCT_API_ORIGIN}/products`, () =>
        HttpResponse.json({ products: [{ id: 'one' }], total: 1 }),
      ),
    )
    expect((await catalogError()).kind).toBe('parse')
  })

  it('AD-6: duplicate product ids are a parse error', async () => {
    const [first] = productFixtures
    server.use(scenarios.catalogOf([first, { ...first, title: 'Duplicate' }]))
    expect((await catalogError()).kind).toBe('parse')
  })

  it('AD-8: an aborted request (unmount or timeout) is a network error', async () => {
    const controller = new AbortController()
    controller.abort()
    const error = await getCatalog(controller.signal).then(
      () => null,
      (e: unknown) => e,
    )
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe('network')
  })

  it('AD-8: a non-JSON body is a parse error', async () => {
    server.use(
      http.get(
        `${PRODUCT_API_ORIGIN}/products`,
        () => new HttpResponse('<html>', { status: 200 }),
      ),
    )
    expect((await catalogError()).kind).toBe('parse')
  })
})

describe('toCents (AD-3)', () => {
  it.each([
    [9.99, 999],
    [0.1 + 0.2, 30],
    [1899.99, 189999],
    [0, 0],
  ])('converts the two-decimal price %s to %i cents', (price, cents) => {
    expect(toCents(price)).toBe(cents)
  })
})

describe('getCategories (AD-5)', () => {
  it('FR3: returns Categories as { slug, name } from the Product API', async () => {
    const categories = await getCategories()
    expect(categories).toEqual(
      categoryFixtures.map(({ slug, name }) => ({ slug, name })),
    )
    expect(categories).toContainEqual({ slug: 'mens-watches', name: 'Mens Watches' })
  })

  it('FR3: a server error is an http error', async () => {
    server.use(scenarios.categoriesError)
    const error = await getCategories().then(
      () => null,
      (e: unknown) => e,
    )
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe('http')
  })

  it('AD-8: a response that fails the DTO schema is a parse error', async () => {
    server.use(
      http.get(`${PRODUCT_API_ORIGIN}/products/categories`, () =>
        HttpResponse.json(['beauty', 'fragrances']),
      ),
    )
    const error = await getCategories().then(
      () => null,
      (e: unknown) => e,
    )
    expect((error as ApiError).kind).toBe('parse')
  })
})

describe('getCategories validation (AD-8)', () => {
  const categoriesAre = (body: JsonBodyType) =>
    server.use(
      http.get(`${PRODUCT_API_ORIGIN}/products/categories`, () =>
        HttpResponse.json(body),
      ),
    )
  const kind = () =>
    getCategories().then(
      () => 'ok',
      (e: ApiError) => e.kind,
    )
  const url = `${PRODUCT_API_ORIGIN}/products/category/x`

  it('AD-8: duplicate slugs are a parse error', async () => {
    categoriesAre([
      { slug: 'beauty', name: 'Beauty', url },
      { slug: 'beauty', name: 'Beauty 2', url },
    ])
    expect(await kind()).toBe('parse')
  })

  it('AD-7: a slug the URL rule would reject is a parse error', async () => {
    categoriesAre([{ slug: 'Mens_Shirts', name: 'Mens Shirts', url }])
    expect(await kind()).toBe('parse')
  })
})

describe('getProduct (AD-5, AD-8)', () => {
  const productError = (id: number) =>
    getProduct(id).then(
      () => null,
      (e: unknown) => e as ApiError,
    )

  it('FR7: requests one Product with the details field list and maps it to cents', async () => {
    let requested: URL | undefined
    server.events.on('request:start', ({ request }) => {
      requested = new URL(request.url)
    })
    let product
    try {
      product = await getProduct(2)
    } finally {
      server.events.removeAllListeners()
    }

    expect(requested?.pathname).toBe('/products/2')
    expect(requested?.searchParams.get('select')).toBe(PRODUCT_SELECT.join(','))
    expect(PRODUCT_SELECT).toEqual([...CATALOG_SELECT, 'images'])
    expect(product).toMatchObject({
      id: 2,
      title: 'Eyeshadow Palette with Mirror',
      priceCents: 1999,
      stock: 44,
    })
    expect(product?.images).toHaveLength(5)
  })

  it.each([404, 400])(
    'FR9: HTTP %i is not-found, with its status',
    async (status) => {
      server.use(scenarios.productStatus(status))
      const error = await productError(2)
      expect(error).toBeInstanceOf(ApiError)
      expect(error?.kind).toBe('not-found')
      expect(error?.status).toBe(status)
    },
  )

  it('FR9: the mock answers an unknown id with 404, which is not-found', async () => {
    expect((await productError(999))?.kind).toBe('not-found')
  })

  it('FR34: a 5xx stays an http error and a fetch failure a network error', async () => {
    server.use(scenarios.productStatus(503))
    expect(await productError(2)).toMatchObject({ kind: 'http', status: 503 })
    server.use(scenarios.productNetworkError)
    expect((await productError(2))?.kind).toBe('network')
  })

  it('AD-8: a record for another id, or one failing the schema, is a parse error', async () => {
    const other = productFixtures[0]
    server.use(
      http.get(`${PRODUCT_API_ORIGIN}/products/:id`, () =>
        HttpResponse.json(other),
      ),
    )
    expect((await productError(2))?.kind).toBe('parse')

    server.use(
      http.get(`${PRODUCT_API_ORIGIN}/products/:id`, () =>
        HttpResponse.json({ id: 2, title: 'No images' }),
      ),
    )
    expect((await productError(2))?.kind).toBe('parse')
  })
})

describe('MSW /products/:id (AD-10)', () => {
  it('answers a non-numeric id with 400 and an unknown one with 404, like DummyJSON', async () => {
    const bad = await fetch(`${PRODUCT_API_ORIGIN}/products/abc`)
    const unknown = await fetch(`${PRODUCT_API_ORIGIN}/products/999`)
    expect(bad.status).toBe(400)
    expect(unknown.status).toBe(404)
  })

  it('keeps /products/categories on its own handler', async () => {
    expect(await getCategories()).not.toHaveLength(0)
  })
})
