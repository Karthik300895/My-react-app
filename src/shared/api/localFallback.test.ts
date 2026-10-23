import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { localJson } from '../../mocks/localData'
import { server } from '../../mocks/node'
import { scenarios } from '../../mocks/scenarios'
import { ApiError } from './ApiError'
import { PRODUCT_API_ORIGIN } from './dto'
import { getCatalog, getProduct, setLocalFallback } from './productApi'

afterEach(() => setLocalFallback(null))

describe('local fallback (dev only, productApi)', () => {
  it('FR34: when the live API is unreachable, the catalog comes from the local data', async () => {
    server.use(scenarios.networkError)
    setLocalFallback(localJson)
    const products = await getCatalog()
    expect(products.length).toBeGreaterThan(0)
    expect(products[0].thumbnail.startsWith('data:image/svg+xml')).toBe(true)
  })

  it('FR34: a server error (5xx) also falls back to the local data', async () => {
    server.use(
      http.get(`${PRODUCT_API_ORIGIN}/products`, () => new HttpResponse(null, { status: 503 })),
    )
    setLocalFallback(localJson)
    expect((await getCatalog()).length).toBeGreaterThan(0)
  })

  it('FR34: without a fallback, an unreachable API still fails', async () => {
    server.use(scenarios.networkError)
    await expect(getCatalog()).rejects.toBeInstanceOf(ApiError)
  })

  it('FR9: a 404 from the live API is not masked by the local data', async () => {
    server.use(scenarios.productStatus(404))
    setLocalFallback(localJson)
    await expect(getProduct(1)).rejects.toMatchObject({ kind: 'not-found' })
  })
})
