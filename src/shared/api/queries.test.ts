import { describe, expect, it } from 'vitest'
import { ApiError, isRetryable } from './ApiError'
import { productFixtures } from '../../mocks/fixtures/products'
import {
  catalogKeys,
  catalogQueryOptions,
  categoriesKeys,
  categoriesQueryOptions,
  productKeys,
  productQueryOptions,
} from './queries'

describe('catalogQueryOptions (AD-5, AD-6)', () => {
  it('FR1: uses the shared key, the adapter, a 10 minute staleTime and gcTime ≥ staleTime', () => {
    const options = catalogQueryOptions()

    expect(options.queryKey).toEqual(catalogKeys.list())
    expect(options.queryKey).toEqual(['catalog', 'list'])
    expect(options.staleTime).toBe(10 * 60 * 1000)
    expect(options.gcTime).toBeGreaterThanOrEqual(options.staleTime as number)
  })

  it('FR1: the query function loads the catalog through the adapter, passing the abort signal', async () => {
    const queryFn = catalogQueryOptions().queryFn as (ctx: {
      signal: AbortSignal
    }) => Promise<unknown[]>
    const products = await queryFn({ signal: new AbortController().signal })
    expect(products).toHaveLength(productFixtures.length)
  })
})

describe('categoriesQueryOptions (AD-5)', () => {
  it('FR3: uses its own key and the 10 minute cache policy, loading through the adapter', async () => {
    const options = categoriesQueryOptions()
    expect(options.queryKey).toEqual(categoriesKeys.all)
    expect(options.staleTime).toBe(10 * 60 * 1000)
    expect(options.gcTime).toBeGreaterThanOrEqual(options.staleTime as number)
    const queryFn = options.queryFn as (ctx: {
      signal: AbortSignal
    }) => Promise<unknown[]>
    expect(
      await queryFn({ signal: new AbortController().signal }),
    ).not.toHaveLength(0)
  })
})

describe('productQueryOptions (AD-5)', () => {
  it('FR7: keys by id, uses the 10 minute cache policy and loads through the adapter', async () => {
    const options = productQueryOptions(4)
    expect(options.queryKey).toEqual(productKeys.detail(4))
    expect(options.queryKey).toEqual(['product', 4])
    expect(productQueryOptions(5).queryKey).not.toEqual(options.queryKey)
    expect(options.staleTime).toBe(10 * 60 * 1000)
    expect(options.gcTime).toBeGreaterThanOrEqual(options.staleTime as number)
    const queryFn = options.queryFn as (ctx: {
      signal: AbortSignal
    }) => Promise<unknown>
    expect(await queryFn({ signal: new AbortController().signal })).toMatchObject(
      { id: 4 },
    )
  })
})

describe('isRetryable (AD-8)', () => {
  it.each([
    [new ApiError('network'), true],
    [new ApiError('http', { status: 503 }), true],
    [new ApiError('http', { status: 404 }), false],
    [new ApiError('http', { status: 429 }), false],
    [new ApiError('parse'), false],
    [new ApiError('not-found'), false],
    [new Error('other'), false],
  ])('%s → %s', (error, expected) => {
    expect(isRetryable(error)).toBe(expected)
  })
})
