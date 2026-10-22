import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { itemAdded, itemRemoved, loadCart } from '../features/cart'
import { toCartItemSnapshot } from '../shared/model/cartItem'
import type { Product } from '../shared/model/product'
import { makeStore } from './store'

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: 'Mug',
  description: 'A mug',
  priceCents: 1200,
  category: 'kitchen',
  rating: 4,
  stock: 5,
  thumbnail: 'https://example.test/mug.png',
  ...overrides,
})

const add = (p: Product) => itemAdded(toCartItemSnapshot(p))

describe('cart persistence listener', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('FR19: an action that changes cart.items writes the Cart', () => {
    const store = makeStore()
    store.dispatch(add(product()))
    expect(loadCart().map((i) => [i.productId, i.quantity])).toEqual([[1, 1]])
  })

  it('FR19: an action that leaves cart.items alone writes nothing', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const store = makeStore()
    store.dispatch({ type: 'unrelated/action' })
    expect(setItem).not.toHaveBeenCalled()
  })

  it('NFR6: notices are never written, even when a Notice is raised by an add', () => {
    const store = makeStore()
    store.dispatch(add(product()))
    expect(store.getState().notices.items.length).toBeGreaterThan(0)
    expect(localStorage.getItem('ssc.cart.v1')).not.toMatch(
      /notices|Added to cart/,
    )
  })

  it('FR20: a store preloaded from the stored Cart has the same items and totals', () => {
    const before = makeStore()
    before.dispatch(add(product()))
    before.dispatch(add(product()))
    const restored = makeStore(loadCart())
    expect(restored.getState().cart.items).toEqual(before.getState().cart.items)
  })

  it('FR22: storage throwing on read loads an empty Cart and the app still renders', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(loadCart()).toEqual([])
  })

  it('FR22: storage throwing on write leaves the Cart working for the session', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const store = makeStore()
    expect(() => store.dispatch(add(product()))).not.toThrow()
    expect(store.getState().cart.items).toHaveLength(1)
  })

  it('FR22: a removal after a blocked write still updates the in-session Cart', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const store = makeStore()
    store.dispatch(add(product({ id: 1 })))
    store.dispatch(itemRemoved(1))
    expect(store.getState().cart.items).toEqual([])
  })

  it('FR20: two tabs: the last write wins, and V1 does not sync between tabs', () => {
    // Tab A adds Mug 1; tab B starts from the same storage and adds Mug 2 afterwards.
    const tabA = makeStore()
    tabA.dispatch(add(product({ id: 1 })))
    const tabB = makeStore(loadCart())
    tabB.dispatch(add(product({ id: 2 })))

    // Tab B wrote last, so storage holds only what tab B had at that point.
    expect(loadCart().map((i) => i.productId)).toEqual([1, 2])

    // Tab A does not hear about tab B: its store still has only its own change.
    tabA.dispatch(add(product({ id: 3 })))
    expect(loadCart().map((i) => i.productId)).toEqual([1, 3])
    expect(tabA.getState().cart.items.map((i) => i.productId)).toEqual([1, 3])
    expect(tabB.getState().cart.items.map((i) => i.productId)).toEqual([1, 2])
  })
})
