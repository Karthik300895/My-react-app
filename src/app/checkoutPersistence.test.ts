import { beforeEach, describe, expect, it } from 'vitest'
import { stepChanged } from '../features/checkout'
import { toCartItemSnapshot } from '../shared/model/cartItem'
import type { Product } from '../shared/model/product'
import { itemAdded } from '../features/cart'
import { makeStore } from './store'

const product: Product = {
  id: 1,
  title: 'Mug',
  description: 'A mug',
  priceCents: 1200,
  category: 'kitchen',
  rating: 4,
  stock: 5,
  thumbnail: 'https://example.test/mug.png',
}

describe('checkout persistence', () => {
  beforeEach(() => localStorage.clear())

  it('NFR6, AD-4: checkout actions never write checkout state to localStorage', () => {
    const store = makeStore()
    store.dispatch(itemAdded(toCartItemSnapshot(product)))
    store.dispatch(stepChanged('shipping'))
    store.dispatch(stepChanged('review'))

    const stored = localStorage.getItem('ssc.cart.v1')!
    expect(JSON.parse(stored)).toEqual({
      version: 1,
      items: [expect.objectContaining({ productId: 1 })],
    })
    expect(stored).not.toMatch(/checkout|step|shippingDraft|lastOrder/)
    expect(store.getState().checkout.step).toBe('review')
  })
})
