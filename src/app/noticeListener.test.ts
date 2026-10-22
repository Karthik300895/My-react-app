import { describe, expect, it } from 'vitest'
import { toCartItemSnapshot } from '../shared/model/cartItem'
import type { Product } from '../shared/model/product'
import { itemAdded } from '../features/cart'
import { noticeForAdd } from './noticeListener'
import { makeStore } from './store'

const product: Product = {
  id: 7,
  title: 'Mug',
  description: 'A mug',
  priceCents: 1200,
  category: 'kitchen',
  rating: 4,
  stock: 2,
  thumbnail: 'https://example.test/mug.png',
}

describe('noticeForAdd', () => {
  it('FR13: a plain add says "Added to cart" and is transient', () => {
    expect(noticeForAdd({ before: 0, after: 1, stock: 5 })).toEqual({
      message: 'Added to cart',
      persistent: false,
    })
  })

  it('FR13: an add that reaches Stock says the Cart has the maximum, and is persistent', () => {
    expect(noticeForAdd({ before: 1, after: 2, stock: 2 })).toEqual({
      message: 'Only 2 available. Your cart has the maximum.',
      persistent: true,
    })
  })

  it('FR13: a refused add at Stock says the same, and is persistent', () => {
    expect(noticeForAdd({ before: 2, after: 2, stock: 2 })).toEqual({
      message: 'Only 2 available. Your cart has the maximum.',
      persistent: true,
    })
  })

  it('FR11: an add of an out-of-stock Product raises no Notice', () => {
    expect(noticeForAdd({ before: 0, after: 0, stock: 0 })).toBeNull()
  })
})

describe('notice listener', () => {
  it('FR13: a successful add raises "Added to cart" in the notices slice', () => {
    const store = makeStore()
    store.dispatch(itemAdded(toCartItemSnapshot(product)))
    expect(store.getState().notices.items.map((n) => n.message)).toEqual([
      'Added to cart',
    ])
  })

  it('FR13: the second add reaches Stock and raises the persistent maximum Notice', () => {
    const store = makeStore()
    store.dispatch(itemAdded(toCartItemSnapshot(product)))
    store.dispatch(itemAdded(toCartItemSnapshot(product)))
    const [newest] = store.getState().notices.items
    expect(newest.message).toBe('Only 2 available. Your cart has the maximum.')
    expect(newest.persistent).toBe(true)
  })
})
