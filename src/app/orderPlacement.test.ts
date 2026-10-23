import { beforeEach, describe, expect, it } from 'vitest'
import { CART_STORAGE_KEY } from '../features/cart'
import {
  placeOrder,
  shippingDraftSaved,
  type ShippingValues,
} from '../features/checkout'
import type { CartItem } from '../shared/model/cartItem'
import { makeStore } from './store'

const item: CartItem = {
  productId: 1,
  title: 'Product 1',
  thumbnail: 'https://example.test/1.png',
  unitPriceCents: 1000,
  stock: 9,
  quantity: 1,
}

const shipping: ShippingValues = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+1 555 010 9999',
  addressLine1: '10 Downing Street',
  addressLine2: '',
  city: 'London',
  state: 'Greater London',
  postalCode: 'SW1A2AA',
  country: 'United Kingdom',
}

describe('order placement and storage', () => {
  beforeEach(() => localStorage.clear())

  it('FR27: placing an Order empties the stored Cart', async () => {
    const store = makeStore([item])
    store.dispatch(shippingDraftSaved(shipping))

    await store.dispatch(placeOrder())

    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}')).toEqual({
      version: 1,
      items: [],
    })
  })

  it('FR28, NFR6: the placed Order and its shipping details are not written to storage', async () => {
    const store = makeStore([item])
    store.dispatch(shippingDraftSaved(shipping))
    await store.dispatch(placeOrder())

    const everything = Object.keys(localStorage)
      .map((key) => `${key}=${localStorage.getItem(key)}`)
      .join('\n')
    expect(everything).not.toMatch(/SSC-|Ada|Downing|ada@example/)
  })
})
