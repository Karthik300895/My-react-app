import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useCartReconciliation } from '../features/cart'
import type { CartItem } from '../shared/model/cartItem'
import { catalogQueryOptions } from '../shared/api/queries'
import { productFixtures } from '../mocks/fixtures/products'
import { server } from '../mocks/node'
import { scenarios } from '../mocks/scenarios'
import { makeStore, type AppStore } from './store'

// Mounts the hook the way RootLayout does, with a QueryClient that does not retry.
function Reconciler() {
  useCartReconciliation()
  return null
}

function setup(items: CartItem[]) {
  const store: AppStore = makeStore(items)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Reconciler />
      </QueryClientProvider>
    </Provider>,
  )
  return { store, queryClient }
}

// Fixture ids: 1 is in stock at $9.99, 7 is out of stock (stock 0). 999 is not in the catalog.
const line = (
  productId: number,
  overrides: Partial<CartItem> = {},
): CartItem => ({
  productId,
  title: `Product ${productId}`,
  thumbnail: `https://example.test/${productId}.png`,
  unitPriceCents: 999,
  stock: 5,
  quantity: 1,
  ...overrides,
})

describe('cart reconciliation with the catalog', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => server.resetHandlers())

  it('FR21: a restored Cart matches the catalog: removed, out of stock, and repriced lines', async () => {
    server.use(scenarios.catalogOf(productFixtures))
    const { store } = setup([
      line(1, { unitPriceCents: 800, quantity: 3 }),
      line(7),
      line(999),
    ])

    await waitFor(() =>
      expect(store.getState().cart.items.map((i) => i.productId)).toEqual([1]),
    )
    const [kept] = store.getState().cart.items
    expect(kept).toMatchObject({ unitPriceCents: 999, quantity: 3 })
  })

  it('UX-DR30: three changes raise one summary Notice with each change listed', async () => {
    server.use(scenarios.catalogOf(productFixtures))
    const { store } = setup([
      line(1, { unitPriceCents: 800 }),
      line(7),
      line(999),
    ])

    await waitFor(() => expect(store.getState().notices.items).toHaveLength(1))
    const [summary] = store.getState().notices.items
    expect(summary).toMatchObject({
      message: '3 changes to your cart',
      persistent: true,
      variant: 'warning',
    })
    expect(summary.details).toHaveLength(3)
  })

  it('FR21, UJ-4: a network error leaves the Cart untouched', async () => {
    server.use(scenarios.networkError)
    const items = [line(1, { unitPriceCents: 800 }), line(7)]
    const { store, queryClient } = setup(items)

    await waitFor(() =>
      expect(
        queryClient.getQueryState(catalogQueryOptions().queryKey)?.status,
      ).toBe('error'),
    )
    expect(store.getState().cart.items).toEqual(items)
    expect(store.getState().notices.items).toEqual([])
  })
})
